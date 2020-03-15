import { Product } from './../../models/product';
import { ProductService } from './../../services/product.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  query: string;
  columnsToDisplay = ['name', 'barcode', 'edit'];
  dataSource: MatTableDataSource<Product>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ){
    this.productService.getAll({ order: { column: 'name', dir: 'asc'} })
    .pipe(
      switchMap(products => {
        this.initializeTable(products);
        return this.route.queryParamMap;
      })
    )
    .subscribe(params => {
      this.query = params.get('filter');
      if (this.query) this.dataSource.filter = this.query.trim().toLowerCase();
      else this.dataSource.filter = null;
    });
  }
  private initializeTable(products: Product[]) {
    this.dataSource = new MatTableDataSource<Product>(products);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filterChange(query: string){
    if (query) {
      this.router.navigate([], {
        queryParams: {filter: query},
        queryParamsHandling: 'merge'
      });
    }else{
      this.router.navigate([]);
    }
  }

  ngOnInit() {
  }

}
