import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { isPlatformServer } from '@angular/common';

export interface Player {
  id: number;
  name: string;
  speed: 'fast' | 'medium' | 'slow';
  acceleration: 'fast' | 'medium' | 'slow';
}

const PLAYER_STATE = makeStateKey<Player>('player');

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html'
})
export class PlayerComponent implements OnInit {

  player$: Observable<any>;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId,
  ) { }

  ngOnInit() {
    this.player$ = this.route.paramMap.pipe(
      filter((params: ParamMap) => !!params.get('id')),
      switchMap((params: ParamMap) => {
        const id = parseFloat(params.get('id'));
        if (this.transferState.hasKey(PLAYER_STATE)) {
          // check if transfer state already looked up player
          console.log('data from transfer state');
          const player = this.transferState.get<Player>(PLAYER_STATE, null);
          this.transferState.remove(PLAYER_STATE);
          return of(player);
        } else {
          // lookup player
          console.log('data re-fetched');
          return of(this.lookupPlayer(id));
        }
      }),
      tap((player: Player) => {
        if (player === undefined) {
          this.error = 'Player not found';
        } else {
          if (isPlatformServer(this.platformId)) {
            console.log('SERVER: set transfer state');
            this.transferState.set(PLAYER_STATE, player);
          }
        }
      })
    );
  }

  lookupPlayer(id: number): Player {
    switch (id) {
      case 1:
        return {
          id: 1,
          name: 'Mario',
          speed: 'medium',
          acceleration: 'medium'
        };
      case 2:
        return {
          id: 2,
          name: 'Yoshi',
          speed: 'slow',
          acceleration: 'fast'
        };
      case 3:
        return {
          id: 3,
          name: 'Bowser',
          speed: 'fast',
          acceleration: 'slow'
        };
      default:
        return undefined;
    }
  }

}
