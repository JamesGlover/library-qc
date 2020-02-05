import math from 'mathjs'

const MAGIC_NUMBER = 1.4826

const median = (values) => {
  let mutableValues = [...values]

  let sortedValues = mutableValues.sort()
  let length = mutableValues.length

  if (length % 2 === 0) {
    return (sortedValues[length/2] + sortedValues[length/2 - 1])/2
  } else {
    return sortedValues[(length+1)/2 - 1]
  }
}

const absoluteDeviation = (values, median) => {
  return values.map(item => math.abs(item - median))
}

const calculation = (values) => {
  let medianResult = median(values)
  let absoluteDeviations = absoluteDeviation(values, medianResult)
  return median(absoluteDeviations)
}

// item - median / (magic * mad ) 
const methodTwo = (values) => {
  let medianResult = median(values)
  let madResult = calculation(values)
  return values.map(item => {
    let result = (item - medianResult) / (MAGIC_NUMBER * madResult)
    let fixedResultString = result.toFixed(10)
    return Number(fixedResultString)
  })
}

// Outlyer is defined as > 3.5 or < -3.5
const isOutlier = (value) =>{
  return math.abs(value) > 3.5
}

// sample represents whether the average needs to be adjusted if
// it is from a sample. This is important for calculating sample
// standard deviation
const calculateAverage = (values, sample = 0) => {
  let sum = values.reduce(function (a, b) { return a + b })
  return (sum / (values.length - sample)).toFixed(3)
}

const adjustedAverage = (average, conversionFactor, decimalPlaces) => {
  return (average * conversionFactor).toFixed(decimalPlaces)
}

export { median, absoluteDeviation, calculation, methodTwo, isOutlier, calculateAverage, adjustedAverage }