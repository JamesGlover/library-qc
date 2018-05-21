import Vue from 'vue'
import { mount } from '@vue/test-utils'
import Well from '@/components/Well'
import Store from '@/lib/Store'
import { Store as newStore } from '@/lib/Store'
import Plate from '@/components/Plate'

describe('Well.vue', () => {

  let cmp, well, data, $Store, plateId, plate, cmpPlate

  beforeEach(() => {
    plateId = 'plate1'
    cmpPlate = Vue.extend(Plate)
    plate = new cmpPlate({propsData: { id: plateId}})
  })

  describe('Basic', () => {
    beforeEach(() => {
      data = {row: 'A',column: '1', content: 'Basic X4', id: 'A1', concentration:'3.014', plateId: plateId}
      cmp = mount(Well, { propsData: data })
      well = cmp.vm
    })

    it('will have an id', () => {
      expect(well.id).toEqual(data.id)
    })

    it('will have a concentration', () => {
      expect(well.concentration).toEqual(data.concentration)
    })

    it('can be active or inactive', () => {
      expect(well.isActive).toBeTruthy()
      well.isActive = false
      expect(well.isActive).toBeFalsy()
    })

    it ('has a type', () => {
      expect(well.type).toEqual("Basic")
    })

    it('has a location', () => {
      expect(well.location).toEqual('A1')
    })

    it('outputs concentration', () => {
      expect(well.$el.textContent).toMatch(new RegExp(well.concentration))
    })

    it('outputs location', () => {
      expect(well.$el.textContent).toMatch(well.location)
    })

    it('produces json', () => {
      expect(well.json).toEqual({row: 'A', column: '1', content: 'Basic X4', id: 'A1', concentration: '3.014', active: true})
      well.isActive = false
      expect(well.json).toEqual({row: 'A', column: '1', content: 'Basic X4', id: 'A1', concentration: '3.014', active: false})
    })

    it('can have a plateId', () => {
      expect(well.plateId).toEqual('plate1')
    })
  })

  describe('Sample', () => {
    beforeEach(() => {
      $Store = Store
      $Store.sequencescapePlates.add(plate)
      data = {row: 'A',column: '1', content: 'Sample X1', id: 'A1', concentration:'3.014', plateId: plateId}
      cmp = mount(Well, { mocks: { $Store }, propsData: data})
      well = cmp.vm
    })

    it ('has the correct class', () => {
      expect(well.$el.className).toMatch('sample')
    })

    it('has a location', () => {
      expect(well.location).toEqual('A1')
    })

    it('on clicking renders it inactive', () => {
      cmp.trigger('click')
      expect(well.isActive).toBeFalsy()
      expect(well.$el.className).toMatch('inactive')
    })

    it('will create a triplicate', () => {
      let triplicate = well.store.sequencescapePlates.find(plateId).triplicates.find(well.id)
      expect(triplicate).toBeTruthy()
      expect(well.triplicate).toEqual(triplicate)
    })
  })

  describe('Standard', () => {
    beforeEach(() => {
      $Store = Store
      data = { row: 'B', column: '4', id: 'Std 1', concentration: '26.101', content: 'Standard S1', plateId: plateId }
      cmp = mount(Well, { mocks: { $Store }, propsData: data})
      well = cmp.vm
    })

    it('has the correct class', () => {
      expect(well.$el.className).toMatch('standard')
      cmp.trigger('click')
      expect(well.$el.className).toMatch('standard')
    })

    it('will not create a triplicate', () => {
      expect(well.triplicate).toEqual({})
    })
  })

  describe('Outlier', () => {

    let well1, well2, well3

    beforeEach(() => {
      $Store = new newStore
      $Store.sequencescapePlates.add(plate)
      well1 = mount(Well, { mocks: { $Store }, propsData: { row: 'A', column: '13', id: 'A7', concentration: '0.69', content: 'Sample X1', plateId: plateId}})
      well2 = mount(Well, { mocks: { $Store }, propsData: { row: 'A', column: '14', id: 'A7', concentration: '2.677', content: 'Sample X1', plateId: plateId }})
      well3 = mount(Well, { mocks: { $Store }, propsData: { row: 'B', column: '13', id: 'A7', concentration: '0.665', content: 'Sample X1', plateId: plateId }})
    })

    // this would be better to check class but this is brittle
    it('has the correct class', () => {
      expect(well1.vm.needsInspection()).toBeTruthy()
      expect(well2.vm.needsInspection()).toBeTruthy()
      expect(well3.vm.needsInspection()).toBeTruthy()
    })

    // this would be better to check class but this is brittle
    it('removing outlier will be reflected in all wells', () => {
      well2.trigger('click')
      expect(well2.vm.$el.className).toMatch('inactive')
      expect(well1.vm.needsInspection()).toBeFalsy()
      expect(well3.vm.needsInspection()).toBeFalsy()
    })

  })

  describe('Control', () => {
    beforeEach(() => {
      $Store = Store
      data = { row: 'B', column: '8', id: 'Ctrl 1', concentration: '25.12', content: 'Control C1', plateId: plateId }
      cmp = mount(Well, { mocks: { $Store }, propsData: data})
      well = cmp.vm
    })

    it('has the correct class', () => {
      expect(well.$el.className).toMatch('control')
      cmp.trigger('click')
      expect(well.$el.className).toMatch('control')
    })

    it('will not create a triplicate', () => {
      expect(well.triplicate).toEqual({})
    })
  })

  describe('Empty', () => {
    beforeEach(() => {
      $Store = Store
      data = {id: '', concentration: '', type: '' }
      cmp = mount(Well, { mocks: { $Store }, propsData: data})
      well = cmp.vm
    })

    it('has the correct class', () => {
      cmp.trigger('click')
      expect(well.$el.className).not.toMatch('inactive')
    })
  })

  describe('Compare', () => {

    let well1, well2, well3

    beforeEach(() => {
      let well = Vue.extend(Well)
      well1 = new well({propsData: {row: 'A',column: '1', content: 'Sample X1', id: 'A1', concentration:'3.014', plateId: plateId}})
      well2 = new well({propsData: {row: 'A',column: '14', content: 'Sample X1', id: 'A1', concentration:'3.014', plateId: plateId}})
      well3 = new well({propsData: {row: 'B',column: '2', content: 'Sample X1', id: 'A1', concentration:'3.014', plateId: plateId}})
    })

    it('well with higher row should be higher', () => {
      expect(well3.compare(well1)).toEqual(1)
    })

    it('well with lower row should be lower', () => {
      expect(well1.compare(well3)).toEqual(-1)
    })

    it('well with same row and higher column should be higher', () => {
      expect(well2.compare(well1)).toEqual(1)
    })

    it('well with same row and lower column should be lower', () => {
      expect(well1.compare(well2)).toEqual(-1)
    })

    it('well with same row and column should be equal', () => {
      expect(well1.compare(well1)).toEqual(0)
    })
  })
})