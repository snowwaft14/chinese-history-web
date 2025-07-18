declare module '@bmapgl-plugin/cluster' {
  export namespace Cluster {
    export enum ClusterEvent {
      CLICK = 'click',
      MOUSE_OVER = 'mouseover',
      MOUSE_OUT = 'mouseout',
      CHANGE = 'change'
    }

    export interface ClusterElement {
      getCenter(): any;
      getMarkers(): any[];
    }

    export class View {
      constructor(map: any);
      setData(data: any[]): void;
      on(event: ClusterEvent, handler: (e: any) => void): void;
      off(event: ClusterEvent, handler: (e: any) => void): void;
      clear(): void;
    }
  }

  export = Cluster;
}