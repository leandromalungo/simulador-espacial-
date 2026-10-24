export class InputCoordinator {
  private keyboardX: number = 0;
  private keyboardY: number = 0;
  private touchX: number = 0;
  private touchY: number = 0;
  private isTouchActive: boolean = false;

  public updateKeyboard(normX: number, normY: number) {
    this.keyboardX = normX;
    this.keyboardY = normY;
  }

  public updateTouch(normX: number, normY: number, active: boolean) {
    this.touchX = normX;
    this.touchY = normY;
    this.isTouchActive = active;
  }

  public getKeyboardInput() {
    return { x: this.keyboardX, y: this.keyboardY };
  }

  public getTouchInput() {
    return { x: this.touchX, y: this.touchY, active: this.isTouchActive };
  }
}

export const inputCoordinator = new InputCoordinator();
