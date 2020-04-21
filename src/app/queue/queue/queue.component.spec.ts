import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QueueComponent } from './queue.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MemoizedSelector } from '@ngrx/store';
import { queueClasses } from '../queue.selectors';
import { MockComponent } from 'ng-mocks';
import { QueueClassSlotListComponent } from '../queue-class-slot-list/queue-class-slot-list.component';
import { By } from '@angular/platform-browser';
import { GameClass } from '../models/game-class';

describe('QueueComponent', () => {
  let component: QueueComponent;
  let fixture: ComponentFixture<QueueComponent>;
  let store: MockStore<any>;
  let queueClassesSelector: MemoizedSelector<any, GameClass[]>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        QueueComponent,
        MockComponent(QueueClassSlotListComponent),
      ],
      providers: [
        provideMockStore(),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.inject(MockStore);
    queueClassesSelector = store.overrideSelector(queueClasses, []);

    fixture = TestBed.createComponent(QueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('without any classes', () => {
    it('should not render any QueueClassSlotListComponent instances', () => {
      expect(fixture.debugElement.query(By.css('app-queue-class-slot-list'))).toBeNull();
    });
  });

  describe('with one game class', () => {
    beforeEach(() => {
      queueClassesSelector.setResult([{ name: 'soldier', count: 2 }]);
      store.refreshState();
      fixture.detectChanges();
    });

    it('should render the QueueClassSlotListComponent instance', () => {
      const queueClassSlotListComponent = fixture.debugElement.query(By.css('app-queue-class-slot-list')).componentInstance;
      expect(queueClassSlotListComponent).toBeTruthy();
    });

    it('should wrap the game class in a column if 4 per row max', () => {
      const wrapper = fixture.debugElement.query(By.css('.game-class-column')).nativeElement as HTMLElement;
      expect(wrapper.classList.contains('col-3')).toBe(true);
    });
  });

  describe('with 2 game classes', () => {
    beforeEach(() => {
      queueClassesSelector.setResult([{ name: 'soldier', count: 2 }, { name: 'medic', count: 1 }]);
      store.refreshState();
      fixture.detectChanges();
    });

    it('should render two QueueClassSlotListComponent instances', () => {
      expect(fixture.debugElement.queryAll(By.css('app-queue-class-slot-list')).length).toBe(2);
    });
  });
});
