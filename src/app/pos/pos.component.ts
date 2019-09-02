import { Component, OnInit, HostListener, DoCheck } from '@angular/core';
import { TypeaheadMatch } from 'ngx-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
  dataP: Array<{name: string, p: number}>;
  tblData: Array<any>;
  selectedOption: any;
  selectedValue: string;
  customSelected: string;
  selected: string;
  q: number;
  gt: number = 0;
  customerName="";
  dateX: string="";
  dataSourceUrl: string="./assets/rsheenProducts.json";

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.tblData=[];
    this.getJSON(this.dataSourceUrl).subscribe(d => {
      this.dataP = d;
    });
    const {value: name} = await Swal.fire({
      title: 'Customer Name',
      input: 'text',
      inputPlaceholder: 'Enter Customer Name'
    });
    if(name){
      this.customerName=name;
    }else{
      Swal.fire("empty!");
    }

    let a = new Date();
    a.setDate(a.getDate() +1);
    this.dateX=`${a.getMonth()+1}/${a.getDate()}/${a.getFullYear()}`;
  }


  public getJSON(url): Observable<any> {
    return this.http.get(url);
  }

  async changeDS(){
    const {value: ds} = await Swal.fire({
      title: 'Data Source',
      input: 'text',
      inputPlaceholder: 'Enter Datasource url'
    });
    if(ds){
      this.dataSourceUrl=ds;
      this.getJSON(this.dataSourceUrl).subscribe(d => {
        this.dataP = d;
      });
    }else{
      Swal.fire("empty!");
    }
  }

  onSelect(event: TypeaheadMatch): void {
    this.tblData.push(event.item);
    this.selectedValue='';
  }

  compute(q, i) {
    console.debug(this.tblData);
    let a = this.tblData[i];
    this.tblData[i]['q'] = q;
    this.tblData[i]['t'] = this.tblData[i]['p'] * q;
    this.selectedValue = "";
    this.getTotal();
  }

  getTotal() {
    this.gt = this.tblData.reduce((a, b) => a + b.t, 0);
  }

  delete(i, t) {
    Swal.fire({
      title: 'Are you sure?',
      text: `ITEM: ${t.name}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.tblData.splice(i, 1);
        this.getTotal();
        Swal.fire({
          title: 'Deleted!',
          type: 'success',
          timer: 500,
          showCancelButton: false,
          showConfirmButton: false
        });
      }
    })
  }

  prep() {
    this.tblData.push({
      name: "",
      p: "",
      q: "GT",
      t: this.gt
    });
    this.tblData.map((v) => {
      return {
        name: v.name,
        p: v.p,
        q: v.q,
        t: v.t
      };
    });
  }

  async addItems(){
    const { value: fv } = await Swal.fire({
      title: 'New Item',
      html:
        'Item:  <input id="item" type="text" class="swal2-input">' +
        'Price: <input id="price" type="number" class="swal2-input">',
      focusConfirm: false,
      preConfirm: () => {
        return [
          (<HTMLInputElement>document.getElementById('item')).value,
          (<HTMLInputElement>document.getElementById('price')).value
        ]
      }
    })
    
    if (fv) {
      let a ={name: fv[0], p: fv[1]};
      this.tblData.push(a);
    }
  }

  print() {
    /* this.prep();
    var columns = [
      { title: "Name", dataKey: "name" },
      { title: "Price", dataKey: "p" },
      { title: "Qty", dataKey: "q" },
      { title: "Total", dataKey: "t" }
    ];
    var doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [58,210]
    })
    var totalPagesExp = "{total_pages_count_string}";
    doc.setFontSize(2);
    doc.text('Hello world!', 1, 1)
    doc.autoTable(columns, this.tblData, {
      theme: 'plain',
      startY: false, 
      tableWidth: 'auto', 
      showHead: 'firstPage', 
      margin: 0,
      headStyles: {
        halign: 'center',
        fontSize: 2
      },
      bodyStyles: {
        fontSize: 2,
        cellWidth:'wrap',
        cellPadding:2
      },
      alternateRowStyles:{
        minCellHeight:2
      },
      columnStyles: {
        t: {
          halign: 'right',
          fontStyle: 'bold'
        },
        p: {
          halign: 'right'
        },
        q: {
          halign: 'center'
        },
      },
      didDrawPage: function (dataToPrint) {
        doc.setFontSize(2);
        doc.text(`PAYSLIP`, 1, 80);
        doc.setFontSize(2);
        doc.text(`${name}`, 1, 120);
        doc.setFontSize(2);
        doc.text(`For the Period: `, 1, 140);
      
        var str = "Page " + dataToPrint.pageCount;

        if (typeof doc.putTotalPages === 'function') {
          str = str + " of " + totalPagesExp;
        }
        doc.setFontSize(2);
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.text(str, dataToPrint.settings.margin.left, pageHeight - 10);
    
      },
      didParseCell: function (HookData) {
        console.debug(HookData.table.height);
      }
    });
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }
    var blob = doc.output('blob');
    window.open(URL.createObjectURL(blob)); */
  }

  async exportToCSV(){
    if(this.customerName){
      var csv = [];
      var rows = document.querySelectorAll("table tr");
      csv.push('RHEENA SHEEN MERCHANDISING');
      csv.push('Buntun Tuguegarao City');
      csv.push('09751457678 / 09176261806');
      csv.push(`customer name , ${this.customerName}`);
      csv.push('Date: '+this.dateX);
      for (var i = 0; i < rows.length; i++) {
          var row = [], cols = rows[i].querySelectorAll("td, th");
          
          for (var j = 0; j < cols.length-1; j++) 
              row.push((cols[j] as HTMLElement).innerText);
          
          csv.push(row.join(","));        
      }
      csv.push('');
      csv.push('GRAND TOTAL: '+this.gt);
      csv.push('Thank You!');
      csv.push('');
      csv.push('');
      csv.push('');
      csv.push('');
      csv.push('');
      csv.push('');
      csv.push('');
      csv.push('');
      csv.push('');
      csv.push('');
      csv.push('Signature');
      // Download CSV file
      this.downloadCSV(csv.join("\n"), `${this.customerName}${this.dateX}.csv`);
      Swal.fire({
        title: 'Downloaded!',
        type: 'success',
        showConfirmButton: false,
        showCancelButton: false,
        timer: 500
      })
    }else{
      Swal.fire('Empty!');
    }
    
  }

  downloadCSV(csv, filename){
    var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], {type: "text/csv"});

    downloadLink=document.createElement("a");
    downloadLink.download=filename;
    downloadLink.href=window.URL.createObjectURL(csvFile);
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

}
