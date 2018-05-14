# LSTM for international airline passengers problem with time step regression framing
import numpy
import matplotlib.pyplot as plt
from pandas import read_csv
import math
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
import pandas as pd
from pymongo import MongoClient
from dateutil import parser
from scipy.signal import lfilter

pd.set_option('expand_frame_repr', False)
pd.set_option('display.max_rows', 20)


def read_from_db(collection, start, host="localhost", port= 27017):
    """Read collection with timeseries from db"""
    import calendar
    client = MongoClient(host, port)
    db=client.RippleExchangeData
    min = calendar.timegm(start.timetuple()) * 1000
    return read_chunked(db[collection].find({"_id" : { "$gte" : min }}).sort("start", 1), 128, "start")

def prepare_data(df: pd.DataFrame, cols):
    df = df.assign(r1=(df['high']-df['low'])) 
    df = df.assign(r2=(df['close']-df['open']))
    df = df.assign(r3=(df['high']-df['close']))
    df = df.assign(r4=(df['open']-df['low']))
    df = df.assign(diff=(df['vwap']-df['vwap'].shift(-1)))

    df.dropna(inplace=True)

    return df.loc[:, cols].astype('float64')

def filter(dataset):
    from scipy import signal
    
    b, a = signal.butter(3, 0.05)
    return signal.filtfilt(b, a, dataset)

def read_chunked(iterator, chunk_size: int, index):
  """Turn an iterator into multiple small pandas.DataFrame"""
  records = []
  frames = []
  for i, record in enumerate(iterator):
    records.append(record)
    if i % chunk_size == chunk_size - 1:
      frames.append(pd.DataFrame(records))
      records = []
  if records:
    frames.append(pd.DataFrame(records))
  df = pd.concat(frames)
  #df['start'].dt.tz_localize(pytz.utc)
  df.set_index(index, inplace=True)
  return df

def reindex(df: pd.DataFrame):
    """ reindex dataset and add missing timestamps """
    start = df[:1].index[0] 
    end = df[-1:].index[0]
    date_index = pd.date_range(start=start, end=end, freq='5min')

    return df.reindex(date_index, fill_value=0)

def convert_to_supervised(df: pd.DataFrame, n_in=1, n_out=1, n_outcols=1, c=None):
    """convert series to supervised learning"""
    cols = list()
    
    if not isinstance(df, pd.DataFrame):
        df = pd.DataFrame(df)

    # input sequence (t-n, ... t-1)
    for i in range(n_in, 0, -1):
        cols.append(df.shift(i))
        #names += [('%s (t-%d)' % (j, i)) for j in df.columns]

    for i in range(0, n_out):
        if (c != None):
            part = df.shift(-i).iloc[:,c]
        else:
            part = df.shift(-i).iloc[:,-1:]
            
        cols.append(part)
        #if i == 0:
        #    names += [('%s (t)' % (j)) for j in part.columns]
        #else:
            #names += [('%s (t+%d)' % (j, i)) for j in part.columns]
    
    # put it all together
    agg = pd.concat(cols, axis=1)
    #agg.columns = names
    agg.dropna(inplace=True)

    X = agg.iloc[:,:-n_outcols * n_out].values
    X = X.reshape((X.shape[0], 1, X.shape[1]))
    Y = agg.iloc[:,-n_outcols * n_out:].values

    return X,Y

def scale(df, n_outcols):    
    # normalize the dataset with 2 different scaler for in and output

    if (df.shape[1] > n_outcols):
        dataset_in = df.iloc[:,n_outcols:].values 
        dataset_out = df.iloc[:,:n_outcols].values 

        scaler_in = MinMaxScaler(feature_range=(0, 1))
        dataset_in = scaler_in.fit_transform(dataset_in)

        scaler_out = MinMaxScaler(feature_range=(0, 1))
        dataset_out = scaler_out.fit_transform(dataset_out)

        return numpy.concatenate((dataset_in, dataset_out), axis=1), scaler_out, scaler_in
    else:
        scaler = MinMaxScaler(feature_range=(0, 1))
        return scaler.fit_transform(df), scaler, scaler

def split(dataset, factor, n_look_back = 1, n_predict = 1):
    # split into train and test sets
    train_size = int(len(dataset) * factor)
    train, test = dataset[0:train_size,:], dataset[train_size-n_look_back-(2*n_predict-1):,:]

    # reshape into X=t and Y=t+1
    trainX, trainY = convert_to_supervised(train, n_look_back, n_predict)
    testX, testY = convert_to_supervised(test, n_look_back, n_predict)

    return [trainX, trainY],[testX, testY]

def get_trained_model(X,Y, n_out, n_epoch = 100, n_batch =1):
    from keras.models import Sequential
    from keras.layers import Dense
    #from keras.layers import Dropout
    from keras.layers import LSTM
    from keras.layers import Activation

    # create and fit the LSTM network
    model = Sequential()

    model.add(LSTM(units = 50, return_sequences = True, input_shape=(X.shape[1], X.shape[2])))
    model.add(LSTM(units = 50, return_sequences=True))
    model.add(LSTM(units = 50))
    model.add(Dense(n_out))
    model.add(Activation('selu'))
    model.compile(loss='mean_squared_error', optimizer='adam')

    weights_loaded = False

    model_name = './l%d_o%d_p%d_b%d_e%d.h5' % (n_look_back, n_outcols, n_predict, n_batch_size, n_epoch)

    import os.path as path
    if (path.isfile(model_name)):
        try:
            model.load_weights(model_name)
            print("Loaded model from disk")
            weights_loaded = True
        except:
            print("Can not load existing wights file. Start new training...")

    if not weights_loaded:
        model.fit(X, Y, epochs=n_epoch, batch_size=n_batch_size, verbose=2)
        model.save_weights(model_name)
        print("Saved model to disk")

    return model     

def predict(model, data, scaler):
    predict = model.predict(data)
    return scaler_out.inverse_transform(predict)


# fix random seed for reproducibility
numpy.random.seed(5)

n_outcols = 1
n_predict = 6
n_look_back = 24
f_test = 0.75
n_batch_size = 1
n_epoch = 100

#cols = ["base_volume", "buy_volume", "counter_volume", "r1", "r2", "r3", "r4", "count", "diff"]
cols = ["diff"]


start = pd.to_datetime(parser.parse("2018-03-01T00:00:00Z"))


#dataframe = load_cvs_data('international-airline-passengers.csv',[1], 3)
dataframe = read_from_db("Gatehub_XRP_USD_5minute", start)
dataframe = prepare_data(dataframe, cols)
dataframe = reindex(dataframe)

orig = dataframe.iloc[:,-n_outcols:].values

print(dataframe.head(5)) 

dataset, scaler_out, scaler_in = scale(dataframe, n_outcols)
plt.plot(dataset)
plt.show()

train, test = split(dataset, f_test, n_look_back, n_predict)

model = get_trained_model(train[0], train[1], n_outcols * n_predict, n_epoch, n_batch_size)

# make predictions
trainPredict = predict(model, train[0], scaler_out)
testPredict = predict(model, test[0], scaler_out)

trainY = scaler_out.inverse_transform(train[1])
testY = scaler_out.inverse_transform(test[1])
# calculate root mean squared error

for i in range(0, n_predict):
    trainScore = math.sqrt(mean_squared_error(trainY[:,i], trainPredict[:,i]))
    print('Train Day %d Score: %.2f RMSE' % (i,trainScore))
    testScore = math.sqrt(mean_squared_error(testY[:,i], testPredict[:,i]))
    print('Test  Day %d Score: %.2f RMSE' % (i, testScore))

# shift train predictions for plotting
day1 = trainPredict[:,0:1]
trainPredictPlot = numpy.empty_like(orig)
trainPredictPlot[:, :] = numpy.nan
trainPredictPlot[n_look_back:len(trainPredict)+n_look_back, :] = day1
# shift test predictions for plotting
result = testPredict[:,n_predict-1:n_predict]
testPredictPlot = numpy.empty_like(orig)
testPredictPlot[:, :] = numpy.nan
#testPredictPlot[len(trainPredict)+n_look_back+2:len(dataset)-(n_predict-1)+2, :] = result
testPredictPlot[-result.shape[0]:, :] = result
# plot baseline and predictions
plt.plot(orig)
plt.plot(trainPredictPlot)
plt.plot(testPredictPlot)
plt.show()