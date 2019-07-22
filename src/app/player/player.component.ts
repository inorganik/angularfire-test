import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, switchMap, tap, shareReplay } from 'rxjs/operators';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { isPlatformServer } from '@angular/common';

export interface Player {
  id: number;
  name: string;
  speed: 'fast' | 'medium' | 'slow';
  acceleration: 'fast' | 'medium' | 'slow';
  favoriteTrack: number;
}

export interface Track {
  id: number;
  name: string;
}

const PLAYER_STATE = makeStateKey<Player>('player');
const TRACK_STATE = makeStateKey<Track>('track');

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html'
})
export class PlayerComponent implements OnInit {

  player$: Observable<Player>;
  track$: Observable<Track>;
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
          console.log('data from transfer state for player');
          const player = this.transferState.get<Player>(PLAYER_STATE, null);
          this.transferState.remove(PLAYER_STATE);
          return of(player);
        } else {
          // lookup player
          console.log('fetch data');
          return this.lookupPlayer(id);
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
      }),
      shareReplay(1)
    );

    this.track$ = this.player$.pipe(
      switchMap(player => {
        if (this.transferState.hasKey(TRACK_STATE)) {
          const track = this.transferState.get<Track>(TRACK_STATE, null);
          this.transferState.remove(TRACK_STATE);
          return of(track);
        } else {
          return this.lookupTrack(player);
        }
      }),
      tap((track: Track) => {
        if (!track) {
          this.error = 'Track not found';
        } else {
          if (isPlatformServer(this.platformId)) {
            console.log('SERVER: set transfer state for track');
            this.transferState.set(TRACK_STATE, track);
          }
        }
      })
    );
  }

  lookupPlayer(id: number): Promise<Player> {
    return new Promise((resolve, reject) => {
      let player;
      switch (id) {
        case 1:
          player = {
            id: 1,
            name: 'Mario 👲🏻',
            speed: 'medium',
            acceleration: 'medium',
            favoriteTrack: 1
          };
          break;
        case 2:
          player = {
            id: 2,
            name: 'Yoshi 🦖',
            speed: 'slow',
            acceleration: 'fast',
            favoriteTrack: 2
          };
          break;
        case 3:
          player = {
            id: 3,
            name: 'Bowser 👹',
            speed: 'fast',
            acceleration: 'slow',
            favoriteTrack: 3
          };
          break;
        default:
          player = undefined;
        }
      resolve(player);
    });
  }

  lookupTrack(player: Player): Promise<Track> {
    const tracks = [
      { id: 1, name: 'Mario Raceway' },
      { id: 2, name: 'Yoshi Valley' },
      { id: 3, name: 'Bowser\'s Castle' }
    ];
    return new Promise((resolve, reject) => {
      resolve(tracks.find(track => player.favoriteTrack === track.id));
    });
  }

}
