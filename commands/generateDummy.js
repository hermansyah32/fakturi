import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

class Pelanggan {
  constructor(nama, alamat, NPWP, NIK) {
    this.nama = nama;
    this.alamat = alamat;
    this.NPWP = NPWP;
    this.NIK = NIK;
  }
}

class Produk {
  constructor(nama, kode, harga) {
    this.nama = nama;
    this.kode = kode;
    this.harga = harga;
  }
}

const generate = () => {
  const sheetJson = [];
  let daftarPelanggan = new Map();
  let daftarProduk = new Map();
  const tanggalMulai = dayjs().subtract(1, "month").startOf("month");
  const tanggalAkhir = dayjs().subtract(1, "month").endOf("month");

  // inisiasi pelanggan
  while (daftarPelanggan.size <= 500) {
    const namaPelanggan = faker.name.firstName();
    const alamatPelanggan = faker.address.streetAddress(false);
    const NIK = faker.random.numeric(13);
    const NPWP = faker.random.numeric(16);
    daftarPelanggan.set(
      namaPelanggan,
      new Pelanggan(namaPelanggan, alamatPelanggan, NPWP, NIK)
    );
  }
  daftarPelanggan = [...daftarPelanggan.entries()].map((dataMap) => {
    return dataMap[1];
  });

  // inisiasi produk
  while (daftarProduk.size <= 500) {
    const namaProduk = faker.commerce.productName();
    const kodeProduk = faker.commerce.product() + faker.random.numeric(4);
    const hargaProduk = faker.commerce.price(100, 10000, 0);
    daftarProduk.set(
      kodeProduk,
      new Produk(namaProduk, kodeProduk, hargaProduk)
    );
  }
  daftarProduk = [...daftarProduk.entries()].map((dataMap) => {
    return dataMap[1];
  });

  // tulis header
  sheetJson.push({
    A: "Nama Pelanggan",
    B: "Nama Produk",
    C: "Kode Produk",
    D: "Tanggal Pembelian",
    E: "Harga per Item",
    F: "Jumlah",
    G: "Total Harga",
    H: "Diskon",
    I: "Total Bayar",
    J: "NIK",
    K: "NPWP",
    L: "Alamat",
  });

  for (let index = 0; index < faker.random.numeric(3); index++) {
    const currentPelanggan = Math.floor(Math.random() * daftarPelanggan.length);
    const jumlahProdukBeli = Math.floor(Math.random() * 30);
    for (let item = 0; item < jumlahProdukBeli; item++) {
      const currentProduk = Math.floor(Math.random() * daftarProduk.length);
      const jumlahProduk = Math.round(Math.random() * 30);
      const totalHarga = daftarProduk[currentProduk].harga * jumlahProduk;
      const diskon = Math.round(Math.random() * (0.2 * totalHarga));
      const totalBayar = totalHarga - diskon;
      sheetJson.push({
        A: daftarPelanggan[currentPelanggan].nama,
        B: daftarProduk[currentProduk].nama,
        C: daftarProduk[currentProduk].kode,
        D: faker.date.between(tanggalMulai.toDate(), tanggalAkhir.toDate()),
        E: daftarProduk[currentProduk].harga,
        F: jumlahProduk,
        G: totalHarga,
        H: diskon,
        I: totalBayar,
        J: daftarPelanggan[currentPelanggan].NIK,
        K: daftarPelanggan[currentPelanggan].NPWP,
        L: daftarPelanggan[currentPelanggan].alamat,
      });
    }
  }

  const XLSX = require("xlsx");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sheetJson, { skipHeader: true });
  wb.SheetNames.push("transaksi");
  wb.Sheets["transaksi"] = ws;
  XLSX.writeFile(wb, process.cwd() + "/tests/res/source.xlsx");
};

generate();
