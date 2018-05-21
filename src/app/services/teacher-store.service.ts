import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { URI_TEACHERS, ROLE_TEACHER } from '../app.config';
import { UserBackendService } from './user-backend.service';
import { MatSnackBar } from '@angular/material';


import { ManagerStoreService } from './manger-store.service';


@Injectable({
    providedIn: 'root',
})
export class TeacherStoreService {

    private usersSource = <BehaviorSubject<User[]>>new BehaviorSubject([]);
    public readonly users$ = this.usersSource.asObservable();
    private dataStore: { users: User[] };

    private errorSubject = <Subject<any>>new Subject();
    public readonly errorMessage$ = this.errorSubject.asObservable();

    private successSubject = <Subject<any>>new Subject();
    public readonly successMessage$ = this.successSubject.asObservable();

    private createSuccessSubject = <Subject<User>>new Subject();
    public readonly createSuccess$ = this.createSuccessSubject.asObservable();

    private updateSuccessSubject = <Subject<User>>new Subject();
    public readonly updateSuccess$ = this.updateSuccessSubject.asObservable();

    private deleteSuccessSubject = <Subject<User>>new Subject();
    public readonly deleteSuccess$ = this.deleteSuccessSubject.asObservable();

    private setRolesSubject = <Subject<User>>new Subject();
    setRoles$ = this.setRolesSubject.asObservable();

    uriRole: string = URI_TEACHERS;
    role: string = ROLE_TEACHER;

    constructor(private userBackendService: UserBackendService, private httpCli: HttpClient) {
        this.dataStore = { users: [] };
    }

    getUsers() {
        console.log(`************GET-${this.uriRole}************`);
        this.userBackendService
            .getUsers(this.uriRole)
            .subscribe(data => {
                if (data.length === 0) {
                    data = null;
                    this.successSubject.next('Lista de Docentes vacia');
                } else {
                    this.dataStore.users = data;
                    this.usersSource.next(Object.assign({}, this.dataStore).users);
                    // this.successSubject.next('retrieve users ok');
                }
            }, error => {
                console.error('error retrieving users, ' + error.message);
                this.errorSubject.next('Error al obtener lista de Docentes');
            });
    }

    create(user: User) {
        this.userBackendService
            .create(user, this.uriRole)
            .subscribe(data => {
                this.dataStore.users.push(data);
                this.usersSource.next(Object.assign({}, this.dataStore).users);
                this.successSubject.next('Docente Creado');
                this.createSuccessSubject.next(data);
            }, error => {
                console.error('could not create User, ' + error.message);
                this.errorSubject.next('Error al crear Docente');
            });
    }

    update(user: User) {
        this.userBackendService
            .update(user, this.uriRole)
            .subscribe(data => {
                this.dataStore.users.forEach((u, i) => {
                    if (u.id === data.id) {
                        this.dataStore.users[i] = data;
                    }
                });
                this.usersSource.next(Object.assign({}, this.dataStore).users);
                this.successSubject.next('Docente Actualizado');
                this.updateSuccessSubject.next(data);
            }, error => {
                console.error('could not update user from store, ' + error.message);
                this.errorSubject.next('Error al actualizar Docente');
            });
    }

    delete(user: User) {
        this.userBackendService
            .delete(user.id, this.uriRole)
            .subscribe(() => {
                this.dataStore.users.forEach((u, i) => {
                    if (u.id === user.id) { this.dataStore.users.splice(i, 1); }
                });
                this.usersSource.next(Object.assign({}, this.dataStore).users);
                this.successSubject.next('Docente Eliminado');
                this.deleteSuccessSubject.next(user);
            }, error => {
                console.error('could not delete user from store, ' + error.message);
                this.errorSubject.next('Error al borrar Docente');
            });
    }


    getUserById(id: string) {
        this.userBackendService
            .getUserById(id, this.uriRole)
            .subscribe(data => {
                let notFound = true;
                this.dataStore.users.forEach((item, index) => {
                    if (item.id === data.id) {
                        this.dataStore.users[index] = data;
                        notFound = false;
                    }
                });

                if (notFound) {
                    this.dataStore.users.push(data);
                }

                this.usersSource.next(Object.assign({}, this.dataStore).users);
                //  this.successSubject.next('success');
            }, error => {
                console.error(`could not load user, ${error.message}`);
                this.errorSubject.next('Error al obtener Docente');
            });

    }

    getUsersByRole(role: string) {
        this.userBackendService
            .getUsersByRole(role, this.uriRole)
            .subscribe(data => {
                this.dataStore.users = data;
                this.usersSource.next(Object.assign({}, this.dataStore).users);
                //  this.successSubject.next('success');
            }, error => {
                console.error('error retrieving user by role' + error.message);
                this.errorSubject.next('Error al obtener Docentes');
            });
    }

    updateUserFromStore(user: User) {
        if (this.dataStore.users.length > 0) {
            let notFound = true;
            this.dataStore.users.forEach((u, i) => {
                if (u.id === user.id) {
                    notFound = false;
                    if (user.roles.includes(this.role)) {
                        this.dataStore.users[i] = user;
                        console.log('actualizado en la teacher-store');
                    } else {
                        this.dataStore.users.splice(i, 1);
                        console.log('eliminado de la teacher-store');
                    }
                }
            });
            if (notFound && user.roles.includes(this.role)) {
                this.dataStore.users.push(user);
                console.log('agregado a la teacher-store');
            }
            this.usersSource.next(Object.assign({}, this.dataStore).users);
        }
    }

    deleteUserFromStore(user: User) {
        let notFound = true;
        this.dataStore.users.forEach((u, i) => {
            if (u.id === user.id) {
                let notFound = false;
                this.dataStore.users.splice(i, 1);
                console.log('eliminado en la teacher-store');
            }
        });
        if (!notFound) {
            this.usersSource.next(Object.assign({}, this.dataStore).users);
        }

    }


    setRoles(user: User) {
        this.userBackendService
            .setRoles(user.id, user.roles, this.uriRole)
            .subscribe(data => {

                this.dataStore.users.forEach((u, i) => {
                    if (u.id === data.id) {
                        data.roles.includes(this.role) ? this.dataStore.users[i] = data : this.dataStore.users.splice(i, 1);
                    }
                });
                this.usersSource.next(Object.assign({}, this.dataStore).users);
                this.successSubject.next('Privilégios asignados');
                this.setRolesSubject.next(data);
            }, error => {
                console.error('could not set user role from store, ' + error.message);
                this.errorSubject.next('Error al asignar privilégios');
            });
    }


    deleteStore(): void {
        this.dataStore = { users: [] };
        this.usersSource.next(Object.assign({}, this.dataStore).users);
    }


}