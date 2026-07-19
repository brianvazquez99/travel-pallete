import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { createApi } from "unsplash-js";
@Component({
  selector: 'app-root',
  imports: [ FormsModule, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit  {
  protected readonly title = signal('travel-pallete');

  http = inject(HttpClient)
  cities = toSignal<[string, string][]>(this.http.get<[string, string][]>('/us-cities-minimal.json'))
  searchString = signal<string>('')
  selectedCity = signal<[string, string] | null>(null)

  unsplashApi = createApi({
    accessKey:
  })

  cityIndex = computed(() => {
    const cities = this.cities()
    const indexMap = new Map<string, [string, string][]>()
    cities?.forEach(element => {
      const index = element[0].slice(0,2).toLowerCase()
      if (!indexMap.has(index)) {
        indexMap.set(index, [element])
      }
      else {
        let values = indexMap.get(index)
        values!.push(element)
        indexMap.set(index, values!)
      }
    });
    console.log(indexMap)
    return indexMap
  })

  citySearchResults = computed(() => {
    const search = this.searchString()

    if(search !== ''){
      console.log(this.search(search))
      return this.search(search)
    }

    return []

  })



  ngOnInit(): void {
    console.log(this.cities())
  }

  search(term:string) : [string, string][] {
    console.log('filtering', term)
    const splitTerm = term.slice(0,2)
    if (this.cityIndex().has(splitTerm)) {
      console.log('index has')
      const cities = this.cityIndex().get(splitTerm.toLowerCase())
      return cities?.filter(el => el[0].toLowerCase().includes(term.toLowerCase())) ?? []
    }
    return []
  }

  selectCiy(city:[string, string]) {
    this.selectedCity.set(city)
    this.searchString.set('')
  }
}
