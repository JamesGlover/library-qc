import Vue from 'vue'
import Well from '@/components/Well'
import {List as Triplicates, Triplicate} from '@/lib/Triplicates'

describe('Triplicates.vue', () => {

  let cmp, well1, well2, well3

  beforeEach(() => {
    cmp = Vue.extend(Well)
    well1 = new cmp({propsData: {row:'A',column:'1',content:'Sample X1',id:'A1',concentration:'3.014'}})
    well2 = new cmp({propsData: {row:'A',column:'2',content:'Sample X1',id:'A1',concentration:'3.163'}})
    well3 = new cmp({propsData: {row:'B',column:'1',content:'Sample X1',id:'A1',concentration:'2.836'}})
  })

  describe('Triplicate', () => {

    let triplicate

    describe('creating all wells up front', () => {

      beforeEach(() => {
        triplicate = new Triplicate([well1, well2, well3])
      })

      it ('will have three wells', () => {
        expect(triplicate.wells).toEqual([well1, well2, well3])
      })

      it('will set an average', () => {
        expect(triplicate.average).toEqual('3.004')
      })

      it('will set a standard deviation', () => {
        // average = 3.004
        // (3.014 - 3.004)squared = 0.0001
        // (3.163 - 3.004)squared = 0.025281
        // (2.836 - 3.004)squared = 0.028224
        // (0.0001 + 0.025281 + 0.028224) / 3 = 0.018
        // sqrt (0.018) = 0.134164078649987

        expect(triplicate.standardDeviation).toEqual('0.134')
      })

      it('will set a cv', () => {
        // (0.134/3.004) * 100 = 4.46
        expect(triplicate.cv).toEqual('4.461')

      })

      it('can retrieve active wells', () => {
        well3.active = false
        expect(triplicate.activeWells).toHaveLength(2)
      })

      it('will recalculate statistics correctly if a well is rendered inactive', () => {
        well3.active = false

        // average = 3.088
        // (3.014 - 3.088)squared = 0.005
        // (3.163 - 3.088)squared = 0.006
        // (0.005 + 0.006) / 2 = 0.006
        // std = sqrt (0.006) = 0.077
        // cv = (0.077/3.088 * 100) = 2.494
        expect(triplicate.average).toEqual('3.088')
        expect(triplicate.standardDeviation).toEqual('0.077')
        expect(triplicate.cv).toEqual('2.494')

      })
    })

    describe('adding wells individually', () => {
      beforeEach(() => {
        triplicate = new Triplicate()
        triplicate.add(well1)
        triplicate.add(well2)
        triplicate.add(well3)
      })

      it ('will have three wells', () => {
        expect(triplicate.wells).toHaveLength(3)
      })

      it ('will create stats', () => {
        expect(triplicate.average).toEqual('3.004')
        expect(triplicate.standardDeviation).toEqual('0.134')
        expect(triplicate.cv).toEqual('4.461')
      })
    })

    describe('when it is empty', () => {
      beforeEach(() => {
        triplicate = new Triplicate()
      })

      it('will indicate it is empty', () => {
        expect(triplicate.empty()).toBeTruthy()
      })

      it('will produce stats without error', () => {
        expect(triplicate.average).toEqual('0')
        expect(triplicate.standardDeviation).toEqual('0')
        expect(triplicate.cv).toEqual('0')
      })
    })
  })

  describe('Triplicates', () => {

    let well4, well5, well6
    let triplicate1, triplicate2, triplicates

    beforeEach(() => {
      triplicate1 = new Triplicate([well1, well2, well3])

      well4 = new cmp({propsData: {row:'A',column:'3',content:'Sample X9',id:'A2',concentration:'5.616'}})
      well5 = new cmp({propsData: {row:'A',column:'4',content:'Sample X9',id:'A2',concentration:'5.341'}})
      well6 = new cmp({propsData: {row:'A',column:'5',content:'Sample X9',id:'A2',concentration:'5.054'}})

      triplicate2 = new Triplicate([well4, well5, well6])

      triplicates = new Triplicates()
      triplicates.add(well1).add(well2).add(well3).add(well4).add(well5).add(well6)

    })

    it('will have the correct number of triplicates', () => {
      expect(triplicates.keys).toEqual(['A1', 'A2'])
    })

    it('each triplicate will have correct stats', () => {
      let firstTriplicate = triplicates.find('A1')
      expect(firstTriplicate.average).toEqual(triplicate1.average)
      expect(firstTriplicate.standardDeviation).toEqual(triplicate1.standardDeviation)
      expect(firstTriplicate.cv).toEqual(triplicate1.cv)
    })

    it('will add the triplicate to the well', () => {
      expect(well1.triplicate).toEqual(triplicate1)
      expect(well6.triplicate).toEqual(triplicate2)
    })

  })
})
