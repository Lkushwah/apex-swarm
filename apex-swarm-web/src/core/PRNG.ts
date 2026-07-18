export class PRNG {
    private a: number;

    constructor(seed: number) {
        this.a = seed;
    }

    // Mulberry32 PRNG
    public next(): number {
        let t = this.a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    public nextRange(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    public nextInt(min: number, max: number): number {
        return Math.floor(this.nextRange(min, max + 1));
    }
}
