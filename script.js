/* ================= DATA ================= */
let data = JSON.parse(localStorage.getItem("mahasiswa")) || [];
let tampil = data;
let editIndex = null;

/* ================= ELEMENT ================= */
const tableBody = document.getElementById("tableBody");
const mahasiswaForm = document.getElementById("mahasiswaForm");
const inputSection = document.getElementById("inputSection");
const dataSection = document.getElementById("dataSection");
const formTitle = document.getElementById("formTitle");
const toastBox = document.getElementById("toast");
const searchNIM = document.getElementById("searchNIM");
const sortSelect = document.getElementById("sortSelect");
const themeToggle = document.getElementById("themeToggle");

/* ================= NAV ================= */
function showInput(){
  inputSection.style.display="block";
  dataSection.style.display="none";
}
function showData(){
  inputSection.style.display="none";
  dataSection.style.display="block";
}

/* ================= TOAST ================= */
function toast(msg,type="info"){
  const t=document.createElement("div");
  t.className="toast "+type;
  t.textContent=msg;
  toastBox.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

/* ================= STORAGE ================= */
function save(){
  localStorage.setItem("mahasiswa", JSON.stringify(data));
}

/* ================= RENDER ================= */
function render(arr=data){
  tampil = arr;
  tableBody.innerHTML = "";
  arr.forEach((m,i)=>{
    tableBody.innerHTML += `
    <tr>
      <td>${m.nim}</td>
      <td>${m.nama}</td>
      <td>${m.prodi}</td>
      <td>
        <span class="edit" onclick="editData(${i})">Edit</span>
        <span class="hapus" onclick="hapusData(${i})">Hapus</span>
      </td>
    </tr>`;
  });
}

/* ================= FORM ================= */
mahasiswaForm.onsubmit = e => {
  e.preventDefault();

  const obj = {
    nim: nim.value.trim(),
    nama: nama.value.trim(),
    prodi: prodi.value
  };

  if(!obj.nim || !obj.nama){
    toast("Data belum lengkap","danger");
    return;
  }

  const nimAda = data.some((m,i)=>m.nim===obj.nim && i!==editIndex);
  if(nimAda){
    toast("NIM sudah terdaftar","danger");
    return;
  }

  if(editIndex === null){
    data.push(obj);
    toast("Data ditambahkan","success");
  } else {
    data[editIndex] = obj;
    editIndex = null;
    formTitle.textContent="Input Mahasiswa";
    toast("Data diperbarui","info");
  }

  mahasiswaForm.reset();
  save();
  render();
  showData();
};

/* ================= CRUD ================= */
function editData(i){
  const m = data[i];
  nim.value = m.nim;
  nama.value = m.nama;
  prodi.value = m.prodi;
  editIndex = i;
  formTitle.textContent="Edit Mahasiswa";
  showInput();
}

function hapusData(i){
  if(confirm("Hapus data ini?")){
    data.splice(i,1);
    save();
    render();
    toast("Data dihapus","danger");
  }
}

/* ================= SEARCH ================= */
function searchData(){
  const k = searchNIM.value.toLowerCase();
  render(data.filter(m=>m.nim.toLowerCase().includes(k)));
}

/* ================= SORT ================= */
function sortData(){
  let arr = [...data];

  if(sortSelect.value==="bubble"){
    for(let i=0;i<arr.length;i++)
      for(let j=0;j<arr.length-i-1;j++)
        if(arr[j].nama > arr[j+1].nama)
          [arr[j],arr[j+1]] = [arr[j+1],arr[j]];
    toast("Bubble Sort diterapkan","success");
  }

  if(sortSelect.value==="merge"){
    arr = mergeSort(arr);
    toast("Merge Sort diterapkan","success");
  }

  render(arr);
}

function mergeSort(a){
  if(a.length<=1) return a;
  const m=Math.floor(a.length/2);
  return merge(mergeSort(a.slice(0,m)),mergeSort(a.slice(m)));
}
function merge(l,r){
  let res=[];
  while(l.length && r.length)
    res.push(l[0].nama<=r[0].nama ? l.shift() : r.shift());
  return res.concat(l,r);
}

/* ================= EXPORT ================= */
function exportCSV(){
  let csv="NIM,Nama,Prodi\n";
  tampil.forEach(m=>csv+=`${m.nim},${m.nama},${m.prodi}\n`);
  download(csv,"mahasiswa.csv","text/csv");
}

function exportExcel(){
  let xls="NIM\tNama\tProdi\n";
  tampil.forEach(m=>xls+=`${m.nim}\t${m.nama}\t${m.prodi}\n`);
  download(xls,"mahasiswa.xls","application/vnd.ms-excel");
}

function download(data,file,type){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([data],{type}));
  a.download=file;
  a.click();
}

/* ================= IMPORT (CSV + EXCEL) ================= */
function importFile(e){
  const file = e.target.files[0];
  if(!file) return;

  const ext = file.name.split(".").pop().toLowerCase();

  if(ext === "csv"){
    importCSV(file);
  }
  else if(ext === "xls" || ext === "xlsx"){
    importExcel(file);
  }
  else{
    toast("Format file tidak didukung","danger");
  }

  e.target.value = "";
}

/* ---------- CSV ---------- */
function importCSV(file){
  const reader=new FileReader();
  reader.onload=ev=>{
    const rows=ev.target.result.split("\n").slice(1);
    let count=0;

    rows.forEach(r=>{
      const [nim,nama,prodi]=r.split(",");
      if(nim && nama && prodi){
        if(!data.some(m=>m.nim===nim.trim())){
          data.push({
            nim:nim.trim(),
            nama:nama.trim(),
            prodi:prodi.trim()
          });
          count++;
        }
      }
    });

    save();
    render();
    toast(`Import CSV berhasil (${count} data)`, "success");
  };
  reader.readAsText(file);
}

/* ---------- EXCEL ---------- */
function importExcel(file){
  const reader=new FileReader();
  reader.onload=e=>{
    const wb=XLSX.read(e.target.result,{type:"binary"});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws);
    let count=0;

    rows.forEach(r=>{
      const nim=String(r.NIM||r.nim||"").trim();
      const nama=String(r.Nama||r.nama||"").trim();
      const prodi=String(r.Prodi||r.prodi||"").trim();

      if(nim && nama && prodi){
        if(!data.some(m=>m.nim===nim)){
          data.push({nim,nama,prodi});
          count++;
        }
      }
    });

    save();
    render();
    toast(`Import Excel berhasil (${count} data)`, "success");
  };
  reader.readAsBinaryString(file);
}

/* ================= DARK MODE ================= */
if(localStorage.theme==="dark"){
  document.body.classList.add("dark");
  themeToggle.textContent="☀️";
}
themeToggle.onclick=()=>{
  document.body.classList.toggle("dark");
  const d=document.body.classList.contains("dark");
  themeToggle.textContent=d?"☀️":"🌙";
  localStorage.theme=d?"dark":"light";
};

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", render);
