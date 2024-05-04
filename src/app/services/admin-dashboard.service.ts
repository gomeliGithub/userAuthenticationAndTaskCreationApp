import { Inject, Injectable, PLATFORM_ID, PipeTransform } from '@angular/core';
import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject, debounceTime, delay, of, switchMap, tap } from 'rxjs';

import { AppService } from '../app.service';

import { IGetUsersData, SearchResult, SortColumn, SortDirection, State } from 'types/global';
import { IUser } from 'types/models';

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

function sort (users: IUser[], column: SortColumn, direction: string): IUser[] {
	if ( direction === '' || column === '' ) {
		return users;
	} else {
		return [...users].sort((a, b) => {
			const res = compare(a[column] as string | number, b[column] as string | number);

			return direction === 'asc' ? res : -res;
		});
	}
}

function matches (user: IUser, term: string, pipe: PipeTransform) {
	return (
		user.login.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
	);
}

@Injectable({
    providedIn: 'root'
})
export class AdminDashboardService {
	private _isBrowser: boolean;

    private _loading = new BehaviorSubject<boolean>(true);
	private _search$ = new Subject<void>();
	private _users = new BehaviorSubject<IUser[]>([]);
	private _total = new BehaviorSubject<number>(0);

    private _state: State = {
		searchTerm: '',
		sortColumn: '',
		sortDirection: '',
	};

    public usersData: IUser[] = [];
	public moreUsersAreExists: boolean;

    constructor (
		@Inject(PLATFORM_ID) platformId: Object,
        private readonly _http: HttpClient,

        private readonly _pipe: DecimalPipe,

        private readonly _appService: AppService
    ) {
		this._isBrowser = isPlatformBrowser(platformId);

		if ( this._isBrowser ) {
			this._getUsers(this.usersData.length, 6).subscribe({
				next: data => {
					this.usersData = data.users;
					this.moreUsersAreExists = data.moreUsersAreExists;

					this._search$.pipe(
						tap(() => this._loading.next(true)),
						debounceTime(200),
						switchMap(() => this._search()),
						delay(200),
						tap(() => this._loading.next(false)),
					).subscribe(result => {
						this._users.next(result.users);
						this._total.next(result.total);
					});

					this._search$.next();
				},
				error: () => this._appService.createAndAddErrorAlert()
			});
		}
    }

    get users () {
		return this._users.asObservable();
	}

	get total () {
		return this._total.asObservable();
	}

	get loading () {
		return this._loading.asObservable();
	}

	get searchTerm () {
		return this._state.searchTerm;
	}

	set searchTerm (searchTerm: string) {
		this._set({ searchTerm });
	}
    
	set sortColumn (sortColumn: SortColumn) {
		this._set({ sortColumn });
	}

	set sortDirection (sortDirection: SortDirection) {
		this._set({ sortDirection });
	}

	private _set (patch: Partial<State>) {
		Object.assign(this._state, patch);

		this._search$.next();
	}

	private _search (): Observable<SearchResult> {
		const { sortColumn, sortDirection, searchTerm } = this._state;

		// 1. sort
		let users = sort(this.usersData, sortColumn, sortDirection);

		// 2. filter
		users = users.filter(user => matches(user, searchTerm, this._pipe));

		const total: number = users.length;

        return of({ users, total });
	}

    private _getUsers (skipCount: number, takeCount: number): Observable<IGetUsersData> {
        return this._http.get<IGetUsersData>('/api/admin-dashboard/getUsersData', { 
            params: { skipCount, takeCount },
            headers: this._appService.createAuthHeaders() ?? { }, withCredentials: true
        });
    }
}