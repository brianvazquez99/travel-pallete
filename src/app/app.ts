import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { getColor } from 'colorthief';
@Component({
  selector: 'app-root',
  imports: [ FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App  {
  protected readonly title = signal('travel-pallete');

  http = inject(HttpClient)
  cities = toSignal<[string, string][]>(this.http.get<[string, string][]>('/us-cities-minimal.json'))
  searchString = signal<string>('')
  selectedCity = signal<[string, string] | null>(null)
  imagesLoading = signal<boolean>(false)


colors = signal<Set<any>>(new Set())
colorsLoading = signal<boolean>(false)

imageResults = signal<any>(null)


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
    return indexMap
  })

  citySearchResults = computed(() => {
    const search = this.searchString()

    if(search !== ''){
      return this.search(search)
    }

    return []

  })



  search(term:string) : [string, string][] {
    const splitTerm = term.slice(0,2)
    if (this.cityIndex().has(splitTerm)) {
      const cities = this.cityIndex().get(splitTerm.toLowerCase())
      return cities?.filter(el => el[0].toLowerCase().includes(term.toLowerCase())) ?? []
    }
    return []
  }

   selectCiy(city:[string, string]) {
    this.selectedCity.set(city)
    this.searchString.set('')
    this.imagesLoading.set(true)
      this.colorsLoading.set(true)
    const params = new HttpParams().appendAll({
      key: '56768085-897e2b96efcb29225047e8985',
      q: this.selectedCity()![0].toLowerCase(),
      'image_type': 'photo'
    })
    this.http.get<any>('https://pixabay.com/api/', {params: params}).subscribe({
      next: (value) => {
        this.imageResults.set(value.hits)
        this.imagesLoading.set(false)
        setTimeout(() => {
          this.detectColors(this.imageResults())

        }, 1500);
      },
      error:(err) => {
        console.error(err)
                this.imagesLoading.set(false)

      },
    })

  }

  async detectColors(images:any[]) {
    if (images.length) {
      const elements = document.querySelectorAll('img')
      let promises: Promise<any>[] = []
      elements.forEach( (value) => {
        promises.push(getColor(value, {worker:true}))
      })
      const colors =await Promise.all(promises)
      this.colors.set(new Set(colors.map(color => color.hex())))
      this.colorsLoading.set(false)
    }
  }
}
