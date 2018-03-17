import { Movie } from './../../models/movie.model';
import { SqliteHelperService } from './../sqlite-helper/sqlite-helper.service';
import { SQLiteObject } from '@ionic-native/sqlite';
import { Injectable } from '@angular/core';


@Injectable()
export class MovieService {

  private db:SQLiteObject;
  private isFirstCall: boolean = true;
  constructor(
    public sqliteHelper : SqliteHelperService
  ) {}
  private getDb():Promise<SQLiteObject>{
    if (this.isFirstCall){
      this.isFirstCall = false;
      return this.sqliteHelper.getDB('kobadb').then((db:SQLiteObject)=>{
        this.db = db;
        this.db.executeSql('CREATE TABLE IF NOT EXISTS movie(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)', {})
        .then((success) => { console.log('movie table created with success',success)})
        .catch((error:Error) => { console.log('error on creating table movie' , error);
        });

        return this.db;
      });
    }
    return this.sqliteHelper.getDB();
  }

  getAll(order?:string): Promise<Movie[]>{
    return this.getDb()
      .then((db:SQLiteObject)=> {
        return this.db.executeSql(`SELECT * FROM movie ORDER BY id ${order || 'DESC'}`,{})
            .then(resultSet => {

              let list: Movie[]  = [];

              for(let i = 0; i< resultSet.rows.length;i++){
                  list.push(resultSet.rows.item(i));
              }
              return list;
            }).catch((error:Error) => {
                  console.log('Error getAll Movie', error);
                   return Promise.reject(new Error('Erro ao executar metodo getAll'));
              }
            )
      });
  }
  create (movie:Movie):Promise<Movie>{
    return this.db.executeSql('INSERT INTO movie (title) VALUES (?)',[movie.title])
    .then(resultSet => {
      movie.id = resultSet.insertId;

      return movie;
    }).catch(
      (error:Error)=>{ 
        console.log(`erro ao criar '${movie.title}' movie `);
        return Promise.reject(error.message);
      });
    
  }
  update(movie:Movie): Promise<boolean>{
    return this.db.executeSql('UPDATE   movie SET TITLE = ? where id=?',[movie.title,movie.id])
    .then((resultSet)=> resultSet.rowsAffected >= 0)
    .catch(erro =>{ console.log('Error update movie')
     return Promise.reject(erro)
    });
    
  }
  delete (id:number): Promise<boolean>{
    return this.db.executeSql('DELETE FROM movie WHERE id=? ', [id])
    .then(resultSet => resultSet.rowsAffected > 0 )
    .catch(erro =>{ console.log('Error delete movie')
    return Promise.reject(erro)
   });
  }
  getById(id:number) : Promise<Movie>{
    return this.db.executeSql('SELECT * FROM movie WHERE id = ?',[id])
    .then(resultSet =>resultSet.rows.item(0))
    .catch(erro =>{ console.log('Error getbyid movie')
    return Promise.reject(erro);
   });
  }
}
