import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  countriesByRegion: SmallCountry[] = []
  borders: SmallCountry[] = []

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) { }

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChanged();
  }


  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChange(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('country')?.setValue('')),
        tap(() => this.borders = []),
        switchMap(region => this.countriesService.getCountriesByRegion(region)),
        tap((countries) => countries.sort((a, b) => a.name < b.name ? -1 : 1))
        //tap((countries) => countries.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .subscribe(countries => {
        // console.log({ countries });
        this.countriesByRegion = countries;
      });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('border')?.setValue('')),
        filter((value: string) => value.length > 0),
        switchMap(alphaCode => this.countriesService.getCountryByAlphaCode(alphaCode)),
        switchMap(country => this.countriesService.getCountriesByCodes(country.borders)),
      )
      .subscribe(countries => {
        //console.log({ borders: country.borders });
        this.borders = countries;
      });
  }




}
