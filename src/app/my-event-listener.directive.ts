import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[myEl]'
})
export class MyEventListenerDirective {

  @Output() hitAfterPrint = new EventEmitter<any>();
  
  @HostListener('afterprint') onAfterPrint() {
    this.hitAfterPrint.emit(true);
  }
}
