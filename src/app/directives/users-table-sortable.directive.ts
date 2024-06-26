import { Directive, EventEmitter, Input, Output } from '@angular/core';

import { SortColumn, SortDirection, SortEvent } from 'types/global';

const rotate: { [ key: string ]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };

@Directive({
    selector: 'th[sortable]',
    standalone: true,
    host: {
		'[class.asc]': 'direction === "asc"',
		'[class.desc]': 'direction === "desc"',
		'(click)': 'rotate()',
	},
})
export class NgbdSortableHeader {
    constructor () { }

    @Input() sortable: SortColumn = '';
	@Input() direction: SortDirection = '';
	@Output() sort = new EventEmitter<SortEvent>();

	rotate() {
		this.direction = rotate[this.direction];
		this.sort.emit({ column: this.sortable, direction: this.direction });
	}
}