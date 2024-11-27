// Store the pack data directly in the JavaScript
const packData = {
  "Wonderland Pack": { "a": 15.2, "b": 60, "c": 25.5, "d": 5, "f": 1, "g": 0.3, "h": 20 },
  "Space Pack": { "a": 75, "b": 20, "c": 4.5, "d": 0.45, "f": 1, "g": 0.05, "h": 20 },
  "Safari Pack": { "a": 75, "b": 21, "c": 3.48, "d": 0.5, "f": 1, "g": 0.02, "h": 20 },
  "Aquatic Pack": { "a": 75, "b": 24.3, "c": 6, "d": 0.5, "f": 1, "g": 0.02, "h": 20 },
  "Ice Monster Pack": { "a": 78, "b": 17, "c": 4.5, "d": 0.45, "f": 1, "g": 0.15, "h": 25 }
  
};

// Populate the dropdown menu with pack names when the page loads
document.addEventListener("DOMContentLoaded", function() {
  const packDropdown = document.getElementById("packDropdown");

  // Loop through the packData object and add options to the dropdown
  for (const packName in packData) {
    const option = document.createElement("option");
    option.value = packName;
    option.textContent = packName;
    packDropdown.appendChild(option);
  }

  // Event listener for when the user selects a pack
  packDropdown.addEventListener("change", function() {
    const selectedPack = packData[packDropdown.value];
    if (selectedPack) {
      // Fill the inputs with the selected pack's data
      document.getElementById("a").value = selectedPack.a;
      document.getElementById("b").value = selectedPack.b;
      document.getElementById("c").value = selectedPack.c;
      document.getElementById("d").value = selectedPack.d;
      document.getElementById("f").value = selectedPack.f;
      document.getElementById("g").value = selectedPack.g;
      document.getElementById("h").value = selectedPack.h;
    }
  });
});

// Calculate function
function calculate() {
  const a = parseFloat(document.getElementById("a").value);
  const b = parseFloat(document.getElementById("b").value);
  const c = parseFloat(document.getElementById("c").value);
  const d = parseFloat(document.getElementById("d").value);
  const f = parseFloat(document.getElementById("f").value);
  const g = parseFloat(document.getElementById("g").value);
  const h = parseFloat(document.getElementById("h").value);

  // Calculate r (average tokens back per pack)
  const r = (
    (a * 5) / 100 +
    (b * 20) / 100 +
    (c * 75) / 100 +
    f * (d * 200) / 100
  ) / 25;

  // Calculate t (total tokens to get a chroma)
  const t = (100 / g) * h;

  // Calculate k (total tokens to get a chroma including resells)
  const k = t * (1 - r);

  // Display the results
  document.getElementById("result-t").textContent = t.toFixed(2);
  document.getElementById("result-r").textContent = r.toFixed(4);
  document.getElementById("result-k").textContent = k.toFixed(2);
}
