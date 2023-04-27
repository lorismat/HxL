export default class TestClass { 
  constructor(id, spectralSpreadFactor) {
    this.id = id;
    this.spectralSpreadFactor = spectralSpreadFactor;
  }

  intro() {
    console.log(`id: ${this.id}`);
  }
}