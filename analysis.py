import pspylib as ps
import numpy as np
import os
import re

def extractSmartScriptGrid(dirpath, pattern = r'([0-9]+)[^./\\]*\.tiff', output='combined'):
    if (not (os.path.exists(dirpath) and os.path.isdir(dirpath))):
        raise FileNotFoundError()
    files = dict([(int(re.match(pattern,entry).group(1)), os.path.join(dirpath,entry)) for entry in os.listdir(dirpath) if os.path.isfile(os.path.join(dirpath, entry)) and re.match(pattern ,entry)]  )
    indices = list(files.keys())
    indices.sort()
    data = {}
    for i in indices:
        filepath = files[i]
        if (not os.path.exists(os.path.join(dirpath, filepath))):
            raise FileExistsError()
        file = ps.TiffReader(os.path.join(dirpath, filepath))

        data[i] = file.data.spectData.rawData[0,[0,1]] * 1000 # Data (point, (potential / mV, current / pA))

    match output:
        case 'combined':
            dataCombined = np.zeros((len(data)+1, max(data[indices[0]][1].shape)))
            dataCombined[0] = data[indices[0]][0]
            headerStr = 'potential/mV'
            for i in indices:
                headerStr+=f', current_{i+1}/pA'
                dataCombined[i+1] = data[i][1]
            print(dataCombined)
            np.savetxt(os.path.join(dirpath,'combined.csv'), np.transpose(dataCombined), fmt='%.9f', delimiter=', ', header=headerStr)
        case 'separate':
            for (i, filepath) in files.items():
                np.savetxt(os.path.splitext(filepath)[0] + '.csv', np.transpose(data[i]),  fmt='%.9f', delimiter=', ', header='potential/mV, current/pA')
        case _:
            raise ValueError()

def extractGrid(filepath, output='combined'):
    if (not os.path.exists(filepath)):
        raise FileNotFoundError()
    file = ps.TiffReader(filepath)

    header = file.data.spectHeader
    numPoints = header.spectHeader['numOfPoints'][0]
    numChannels = header.spectHeader['numOfChannels'][0]
    numData = header.spectHeader['numOfDataAllDir'][0]

    channels = header.channelInfo
    for i in channels:
        channels[i] = ("".join([chr(c) for c in channels[i]['name'][0] if c!=0]), "".join([chr(c) for c in channels[i]['unit'][0] if c!=0]))
    potentialIndex = [i for i in channels if channels[i][0]=='Sample Bias'][0]
    currentIndex = [i for i in channels if channels[i][0]=='Current'][0]

    data = np.zeros((numPoints, 2, numData))
    for point in range(numPoints):
        data[point] = file.data.spectData.rawData[point, [point * numChannels + potentialIndex, point * numChannels + currentIndex]]
    data = data * 1000 # Scale units to mV, pA

    match output:
        case 'combined':
            outpath = os.path.splitext(filepath)[0] + '.txt'
            if os.path.exists(outpath):
                raise FileExistsError()
            
            potentialData = data[0,0,:]
            currentData = data[:,1,:]
            combinedData = np.column_stack((potentialData, currentData.T))

            headerStr = 'potential/mV, ' + ', '.join([f'i{i+1}/pA' for i in range(numPoints)])
            np.savetxt(outpath, combinedData,  fmt='%.9f', delimiter=', ', header=headerStr)
        case 'separate':
            dirpath = os.path.splitext(filepath)[0]
            if os.path.exists(dirpath):
                raise FileExistsError()
            os.mkdir(dirpath)

            for point in range(numPoints):
                np.savetxt(os.path.join(dirpath,f'CV{i}.txt'), data[i].T, fmt='%.9f', delimiter=', ', header='potential/mV,current/pA')
        case _:
            raise ValueError()

def extractSingle(filepath):
    if (not os.path.exists(filepath)):
        raise FileExistsError()
    file = ps.TiffReader(filepath)

    data = file.data.spectData.rawData[0,[0,1]] * 1000 # Data (point, (potential / mV, current / pA))

    outpath = os.path.splitext(filepath)[0] + '.txt'
    np.savetxt(outpath, data,  fmt='%.9f', delimiter=', ', header='potential/mV, current/pA')

path = "C:\\Users\\user\\Desktop\\JTC\\20251016 50mM KCl 1mM RuHex\\test"
extractSmartScriptGrid(path, output='combined')