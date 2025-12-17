let data = JSON.parse(localStorage.getItem("mahasiswa")) || [];
let editIndex = null;
let tampil = data;

/* NAV */
function showInput(){
  inputSection.style.display="block";
  dataSection.style.display="none";
}
function showData(){
  inputSection.style.display="none";
  dataSection.style.display="block";
}

/* TOAST */
function toast(msg,type="info"){
  const t=document.createElement("div");
  t.className="toast "+type;
  t.textContent=msg;
  toastBox.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}
const toastBox=document.getElementById("toast");

/* RENDER */
function render(arr=data){
  tampil=arr;
  tableBody.innerHTML="";
  arr.forEach((m,i)=>{
    tableBody.innerHTML+=`
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
  localStorage.setItem("mahasiswa",JSON.stringify(data));
}

/* FORM */
mahasiswaForm.onsubmit = e => {
  e.preventDefault();

  const obj = {
    nim: nim.value.trim(),
    nama: nama.value.trim(),
    prodi: prodi.value
  };

  // 🔒 CEK NIM SUDAH ADA
  const nimSudahAda = data.some((m, i) =>
    m.nim === obj.nim && i !== editIndex
  );

  if (nimSudahAda) {
    toast("❌ NIM sudah terdaftar!", "danger");
    return;
  }

  if (editIndex === null) {
    data.push(obj);
    toast("✅ Data berhasil ditambahkan", "success");
  } else {
    data[editIndex] = obj;
    editIndex = null;
    formTitle.textContent = "Input Mahasiswa";
    toast(" Data berhasil diperbarui", "info");
  }

  mahasiswaForm.reset();
  render();
  showData();
};


/* CRUD */
function editData(i){
  const m=data[i];
  nim.value=m.nim;
  nama.value=m.nama;
  prodi.value=m.prodi;
  editIndex=i;
  formTitle.textContent="Edit Mahasiswa";
  showInput();
}

function hapusData(i){
  if(confirm("Hapus data ini?")){
    data.splice(i,1);
    render();
    toast("Data dihapus","danger");
  }
}

/* SEARCH */
function searchData(){
  const k=searchNIM.value.toLowerCase();
  render(data.filter(m=>m.nim.toLowerCase().includes(k)));
}

/* SORT */
function sortData(){
  let arr=[...data];
  if(sortSelect.value==="bubble"){
    for(let i=0;i<arr.length;i++)
      for(let j=0;j<arr.length-i-1;j++)
        if(arr[j].nama>arr[j+1].nama)
          [arr[j],arr[j+1]]=[arr[j+1],arr[j]];
    toast("Bubble Sort diterapkan","success");
  }
  if(sortSelect.value==="merge"){
    arr=mergeSort(arr);
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
  while(l.length&&r.length)
    res.push(l[0].nama<=r[0].nama?l.shift():r.shift());
  return res.concat(l,r);
}

/* EXPORT */
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

/* IMPORT */
function importFile(e){
  const file = e.target.files[0];
  if(!file) return;

  const ext = file.name.split(".").pop().toLowerCase();

  if(ext === "csv"){
    importCSV(file);
  } else if(ext === "xls" || ext === "xlsx"){
    importExcel(file);
  } else {
    toast("Format file tidak didukung","danger");
  }

  e.target.value = "";
}


/* DARK MODE */
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

render();
