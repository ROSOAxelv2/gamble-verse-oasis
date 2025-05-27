
import plinkoLayout from '@/config/plinkoLayout.json';

export interface PegPosition {
  x: number;
  y: number;
  radius: number;
}

export class PegManager {
  private currentRows: number;
  private boardWidth: number;
  private config: typeof plinkoLayout.pegConfiguration;

  constructor() {
    this.currentRows = plinkoLayout.pegConfiguration.rows;
    this.boardWidth = plinkoLayout.board.width;
    this.config = plinkoLayout.pegConfiguration;
  }

  getCurrentRows(): number {
    return this.currentRows;
  }

  getMinRows(): number {
    return this.config.minRows;
  }

  getMaxRows(): number {
    return this.config.maxRows;
  }

  canIncrease(): boolean {
    return this.currentRows < this.config.maxRows;
  }

  canDecrease(): boolean {
    return this.currentRows > this.config.minRows;
  }

  increasePegs(): void {
    if (this.canIncrease()) {
      this.currentRows++;
    }
  }

  decreasePegs(): void {
    if (this.canDecrease()) {
      this.currentRows--;
    }
  }

  generatePegs(): PegPosition[] {
    const pegs: PegPosition[] = [];
    const startY = 120;
    const centerX = this.boardWidth / 2;

    for (let row = 0; row < this.currentRows; row++) {
      const pegCount = row + 2; // Row 0 has 2 pegs, row 1 has 3, etc.
      const totalWidth = (pegCount - 1) * this.config.baseSpacing;
      const startX = centerX - totalWidth / 2;

      for (let col = 0; col < pegCount; col++) {
        pegs.push({
          x: startX + col * this.config.baseSpacing,
          y: startY + row * this.config.verticalSpacing,
          radius: this.config.radius
        });
      }
    }

    return pegs;
  }

  savePegCount(): void {
    // In a real app, this would persist to localStorage or backend
    localStorage.setItem('plinko-peg-rows', this.currentRows.toString());
  }

  loadPegCount(): void {
    const saved = localStorage.getItem('plinko-peg-rows');
    if (saved) {
      const rows = parseInt(saved, 10);
      if (rows >= this.config.minRows && rows <= this.config.maxRows) {
        this.currentRows = rows;
      }
    }
  }
}
