import { JsonPipe } from '@angular/common';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
  imagesLoading = signal<boolean>(false)


user = httpResource(() => ({
  url: `https://pixabay.com/api/`,
  method: 'GET',

  params: {
    'fast': 'yes',
  },

}));

imageResults = signal<any>(null)
  colors = computed(() => {
    const results = this.imageResults()
    const pallete = new Set()
    if(results) {
      results.forEach((element:any) => {
        console.log('in colors loop', element)
        pallete.add(element.color)
      });
    }
    console.log(pallete)
    return pallete
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
    this.imagesLoading.set(true)
    const params = new HttpParams().appendAll({
      key: '56768085-897e2b96efcb29225047e8985',
      q: this.selectedCity()![0].toLowerCase(),
      'image_type': 'photo'
    })
    this.http.get<any>('https://pixabay.com/api/', {params: params}).subscribe({
      next: (value) => {
        this.imageResults.set(value.hits)
        this.imagesLoading.set(false)
      },
      error:(err) => {
        console.error(err)
                this.imagesLoading.set(false)

      },
    })

  }
}
