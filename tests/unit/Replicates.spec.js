import Vue from 'vue'
import Well from '@/components/wells/Sample'
import {ReplicateList as Replicates, Replicate, NullReplicate} from '@/Replicates'

describe('Replicates.vue', () => {

  let cmp, well1, well2, well3

  beforeEach(() => {
    cmp = Vue.extend(Well)
    well1 = new cmp({propsData: {row:'A',column:'1',content:'Sample X1',id:'A1',concentration:'3.014', plateBarcode: 'DN1234567'}})
    well2 = new cmp({propsData: {row:'A',column:'2',content:'Sample X1',id:'A1',concentration:'3.163', plateBarcode: 'DN1234567'}})
    well3 = new cmp({propsData: {row:'B',column:'1',content:'Sample X1',id:'A1',concentration:'2.836', plateBarcode: 'DN1234567'}})
  })

  describe('Replicate', () => {

    let replicate

    describe('creating all wells up front', () => {

      beforeEach(() => {
        replicate = new Replicate([well1, well2, well3], {cvThreshold: 20})
      })

      it('will have three wells', () => {
        expect(replicate.wells).toEqual([well1, well2, well3])
      })

      it('will set an average', () => {
        expect(typeof(replicate.average)).toEqual('number')
      })

      it('must have some options', () => {
        expect(replicate.options.key).toBeDefined()
        expect(replicate.options.units).toBeDefined()
        expect(replicate.options.conversionFactor).toBeDefined()
      }) 

      it('will set a standard deviation', () => {
        expect(typeof(replicate.standardDeviation)).toEqual('number')
      })

      it('will have an id', () => {
        expect(replicate.id).toEqual(well1.id)
      })

      it('will have a plate barcode', () => {
        expect(replicate.plateBarcode).toEqual('DN1234567')
      })
      
      it('will set a cv', () => {
        // (0.16371418183325878/3.0043333333333333) * 100 = 5.449
        expect(typeof(replicate.cv)).toEqual('number')
        expect(replicate.needsInspection()).toBeFalsy()
      })

      it('can retrieve active wells', () => {
        well3.active = false
        expect(replicate.activeWells).toHaveLength(2)
      })

      it('will recalculate statistics correctly if a well is rendered inactive', () => {
        const stats = replicate.stats
        well3.active = false

        // average = 3.088
        // nM = 7.998
        // (3.014 - 3.088)squared = 0.005
        // (3.163 - 3.088)squared = 0.006
        // (0.005 + 0.006) / 1 = 0.011
        // std = sqrt (0.011) = 0.105
        // cv = (0.105/3.088 * 100) = 3.400
        expect(replicate.stats).not.toEqual(stats)
      })

      it('will return some json for exporting purposes', () => {
        expect(replicate.json).toEqual({
          barcode: replicate.plateBarcode,
          well_location: replicate.id, 
          key: replicate.options.key, 
          value: replicate.adjustedAverage, 
          units: replicate.options.units, 
          cv: replicate.cv, assay_type: 
          replicate.options.assay.type, 
          assay_version: replicate.options.assay.version
        })
      })

    })

    describe('active wells', () => {

      let replicate

      beforeEach(() => {
        replicate = new Replicate([well1, well2, well3])
      })

      it('will only include wells which are set to active', () => {
        expect(replicate.activeWells.length).toEqual(3)

        well1.active = false
        expect(replicate.activeWells.length).toEqual(2)
      })

      it('will only include wells which have a valid concentration', () => {
        well1.concentration = 'n.a.'
        expect(replicate.activeWells.length).toEqual(2)
      })

    })

    describe('conversion', () => {

      it('with no options added', () => {
        replicate = new Replicate([well1, well2, well3])
        expect(replicate.adjustedAverage).toEqual(replicate.average)
      })

      it('with an option', () => {
        replicate = new Replicate([well1, well2, well3], {conversionFactor: 2.590})
        expect(replicate.adjustedAverage).toBeGreaterThan(replicate.average)
      })

    })

    describe('cv threshold', () => {

      let well4, well5, well6
      
      beforeEach(() => {
        well4 = new cmp({propsData: { row: 'A', column: '1', content:'Sample X1', id: 'A1', concentration: '0.685'}})
        well5 = new cmp({propsData: { row: 'A', column: '2', content:'Sample X1', id: 'A1', concentration: '0.960'}})
        well6 = new cmp({propsData: { row: 'A', column: '3', content:'Sample X1', id: 'A1', concentration: '0.660'}})
        replicate = new Replicate([well4, well5, well6], {cvThreshold: 20})
      })

      it('will have a cv threshold', () => {
        expect(replicate.cvThreshold).toEqual(20.000)
      })

      it('will indicate whether the replicate needs to be inspected', () => {
        expect(replicate.needsInspection()).toBeTruthy()
      })

      it('will indicate whether replicate needs to be inspected at the threshold', () => {
        well5 = new cmp({propsData: { row: 'A', column: '2', content:'Sample X1', id: 'A1', concentration: '0.935'}})
        replicate = new Replicate([well4, well5, well6], {cvThreshold: 20})
        expect(replicate.needsInspection()).toBeTruthy()
      })
    })

    describe('adding wells individually', () => {
      beforeEach(() => {
        replicate = new Replicate()
        replicate.add(well1)
        replicate.add(well2)
        replicate.add(well3)
      })

      it ('will have three wells', () => {
        expect(replicate.wells).toHaveLength(3)
      })

      it ('will create stats', () => {
        expect(typeof(replicate.average)).toEqual('number')
        expect(typeof(replicate.standardDeviation)).toEqual('number')
        expect(typeof(replicate.cv)).toEqual('number')
      })
    })

  })

  describe('Replicates', () => {

    let well4, well5, well6
    let replicate1, replicate2, replicates, options

    beforeEach(() => {
      options = {conversionFactor: 2.590, units: 'nM', key: 'Molarity', assay: {type: "Plate Reader", version: "v1.0"}, cvThreshold: 5}
      replicate1 = new Replicate([well1, well2, well3], options)

      well4 = new cmp({propsData: {row:'A',column:'3',content:'Sample X9',id:'A2',concentration:'5.616'}})
      well5 = new cmp({propsData: {row:'A',column:'4',content:'Sample X9',id:'A2',concentration:'5.341'}})
      well6 = new cmp({propsData: {row:'A',column:'5',content:'Sample X9',id:'A2',concentration:'5.054'}})

      replicate2 = new Replicate([well4, well5, well6], options)

      replicates = new Replicates(options)
      replicates.add(well1).add(well2).add(well3).add(well4).add(well5).add(well6)

    })

    it('will have the correct number of replicates', () => {
      expect(Array.from(replicates.keys)).toEqual(['A1', 'A2'])
    })

    it('each replicate will have correct stats', () => {
      let firstReplicate = replicates.find('A1')
      expect(firstReplicate.average).toEqual(replicate1.average)
      expect(firstReplicate.standardDeviation).toEqual(replicate1.standardDeviation)
      expect(firstReplicate.cv).toEqual(replicate1.cv)
    })

    it('will add the replicate to the well', () => {
      expect(well1.replicate).toEqual(replicate1)
      expect(well6.replicate).toEqual(replicate2)
    })

    it('can pass options to each replicate', () => {
      let replicate = replicates.find('A1')
      expect(replicate.options).toEqual(options)
    })

  })

  describe('NullReplicate', () => {
    it('size will always return 0', () => {
      expect(NullReplicate.size).toEqual(0)
    })

    it('needs Inspection will always return false', () => {
      expect(NullReplicate.needsInspection()).toBeFalsy()
    })
  })
})
