import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { GamesService } from './games.service';
import { loadGames, gamesLoaded, gameAdded, loadGame, gameUpdated } from './games.actions';
import { mergeMap, map, filter, mapTo, pairwise, withLatestFrom } from 'rxjs/operators';
import { GamesEventsService } from './games-events.service';
import { Store } from '@ngrx/store';
import { AppState } from '@app/app.state';
import { combineLatest } from 'rxjs';
import { profile } from '@app/profile/profile.selectors';
import { queueLocked, queueUnlocked } from '@app/queue/queue.actions';
import { profileLoaded } from '@app/profile/profile.actions';
import { Router } from '@angular/router';

@Injectable()
export class GamesEffects {

  loadGames = createEffect(() =>
    this.actions.pipe(
      ofType(loadGames),
      mergeMap(() => this.gamesService.fetchGames().pipe(
        map(games => gamesLoaded({ games })),
      )),
    )
  );

  loadGame = createEffect(() =>
    this.actions.pipe(
      ofType(loadGame),
      mergeMap(({ gameId }) => this.gamesService.fetchGame(gameId).pipe(
        map(game => gameAdded({ game })),
      ))
    )
  );

  loadActiveGame = createEffect(() =>
    this.actions.pipe(
      ofType(profileLoaded),
      filter(({ profile: theProfile }) => !!theProfile && !!theProfile.activeGameId),
      map(({ profile: theProfile }) => loadGame({ gameId: theProfile.activeGameId })),
    )
  );

  redirectToNewGame = createEffect(() =>
    this.actions.pipe(
      ofType(gameAdded),
      withLatestFrom(this.store.select(profile)),
      filter(([{ game }, theProfile]) => theProfile && game.players.includes(theProfile.id)),
      map(([{ game }]) => this.router.navigate(['/game', game.id])),
    ), { dispatch: false }
  );

  lockQueue = createEffect(() =>
    combineLatest(
      this.store.select(profile),
      this.actions.pipe(ofType(gameAdded)),
    ).pipe(
      filter(([theProfile, { game }]) => game.players.includes(theProfile.id)),
      mapTo(queueLocked()),
    )
  );

  unlockQueue = createEffect(() =>
    combineLatest(
      this.store.select(profile),
      this.actions.pipe(ofType(gameUpdated)),
    ).pipe(
      filter(([theProfile, { game }]) => game.players.includes(theProfile.id)),
      map(([, { game }]) => game),
      pairwise(),
      filter(([previous, next]) =>
        (previous.state === 'started' || previous.state === 'launching')
          && (next.state === 'ended' || next.state === 'interrputed')),
      mapTo(queueUnlocked()),
    )
  );

  constructor(
    private actions: Actions,
    private gamesService: GamesService,
    private gamesEventsService: GamesEventsService,
    private store: Store<AppState>,
    private router: Router,
  ) {
    this.gamesEventsService.gameCreated.subscribe(game => this.store.dispatch(gameAdded({ game })));
    this.gamesEventsService.gameUpdated.subscribe(game => this.store.dispatch(gameUpdated({ game })));
  }

}
