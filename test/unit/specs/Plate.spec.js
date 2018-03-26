import Vue from 'vue'
import Plate from '@/components/Plate'
import Grid from '@/components/Grid'
import plateReader from '../../data/plate_reader'
import Store from '@/lib/Store'
import { mount } from '@vue/test-utils'

describe('Plate.vue', () => {

  let cmp, vm, grid, plate, $Store, id

  beforeEach(() => {
    $Store = Store
    id = 'plate1'
    grid = new(Vue.extend(Grid))
    grid.addAll(Object.values(plateReader.wells))
    cmp = mount(Plate, {propsData: { id: id }, mocks: { $Store }})
    cmp.setData({grid: grid})
    plate = cmp.vm
  })

  it('will have a grid', () => {
    expect(plate.grid).toEqual(grid)
  })

  it('will have have some columns', () => {
    let columns = plate.$el.querySelector('thead').querySelectorAll('th')
    expect(columns).toHaveLength(grid.numberOfColumns + 1)
    expect(columns[1].textContent).toEqual(grid.columns[0])
    expect(columns[grid.numberOfColumns].textContent).toEqual(grid.columns[grid.numberOfColumns - 1])
  })

  it('will have the correct number of rows', () => {
    expect(plate.$el.querySelector('table').querySelectorAll('.plate-row')).toHaveLength(grid.numberOfRows)
  })

  it('can have an id', () => {
    expect(plate.$el.querySelector('h3').textContent).toEqual('Plate: ' + id)
  })

  it('will create a sequencescape plate in the store', () => {
    expect($Store.sequencescapePlates.find('plate1').id).toEqual('plate1')
  })

  it('will create a new grid for saving', () => {
    let newGrid = plate.toGrid()
    expect(newGrid.columns).toEqual(grid.json.columns)
    expect(Object.keys(newGrid.rows)).toHaveLength(Object.keys(newGrid.rows).length)
  })

  describe('saving', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('will update local storage with updated data', () => {
      let well = plateReader.wells[0]
      plate.$el.querySelector('td').click()
      cmp.find('#save').trigger('click')
      let json = JSON.parse(localStorage.getItem(id))
      expect(json.rows[well.row][well.column].active).toBeFalsy()
    })

    afterEach(() => {
      localStorage.clear()
    })
  })

})
