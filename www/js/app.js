var syncToggled = false;
// toggle sync status page on button click, attempt sync on click
function syncBtnClick() {
  uploadFormEntries();
  if (syncToggled == true) {
    console.log("showing form page");
    document.getElementById("status-page").setAttribute("hidden", true);
    document.getElementById("form-page").removeAttribute("hidden");
    document.getElementById("nav-text").innerHTML = "Scouting Form";
    syncToggled = false;
  } else {
    console.log("showing sync page");
    document.getElementById("form-page").setAttribute("hidden", "true");
    document.getElementById("status-page").removeAttribute("hidden");
    document.getElementById("nav-text").innerHTML = "Sync Status";
    generateSyncStatusList();
    syncToggled = true;
  }
}

var uploadPending = false;
// uploads unsynced form items to server in the background, only allow one connection attempt at a time
async function uploadFormEntries() {
  var itemList = getStoredForms();
  // get list of non-uploaded items
  var itemsToUpload = [];
  for (var i = 0; i < itemList.length; i++) {
    if (itemList[i].Uploaded == false) {
      itemsToUpload.push(itemList[i]);
    }
  }
  // don't bother attempting upload if list length is 0 or if upload is pending
  if (itemsToUpload.length == 0 || uploadPending == true) {
    return;
  }
  uploadPending = true;
  // upload list to server
  await fetch("/scoutInfo", {
    method: "POST",
    body: JSON.stringify(itemsToUpload),
  })
    // .then((response) => response.json())
    .then((result) => {
      if (result.status == 200) {
        console.log("Upload Successful:", result.text());
        // update local list of successfully synced items
        itemsToUpload.forEach((element) => {
          formElement = JSON.parse(localStorage.getItem("form_" + element.ID));
          formElement.Uploaded = true;
          localStorage.setItem("form_" + element.ID, JSON.stringify(formElement));
        });
      } else {
        console.error("Upload Error:", result);
      }
    })
    .catch((error) => {
      console.error("Upload Error:", error);
    });
  uploadPending = false;
  console.log("DONE...."); //FIXME: remove
  generateSyncStatusList();
}

//uses browser prompt to verify user actually wants to clear form, also generates new uuid
function clearForm(skipPrompt = false) {
  if (skipPrompt || window.confirm('Are you sure you want to clear form')) {
    document.getElementById("scouting-form").reset();
    document.getElementById("uuid").value = uuidv4();
    document.getElementById("SaveConfirmationText").innerHTML = "";
    console.log("form cleared...");
  } else {
    console.log("form NOT cleared...");
  }
}

// a magic uuid function copied from here: https://stackoverflow.com/a/2117523
// i have no idea how this works, used for generating a random ID for forms
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

//submit form as JSON to local cache on "save" button click, attempt sync
function submitForm() {
  //check that form is valid before sending
  if (document.getElementById("scouting-form").checkValidity() == false) {
    console.log("Form Invalid.");
    return;
  }
  //serialize form to JSON string
  var jsonForm = serializeForm();
  var jsonString = JSON.stringify(jsonForm);
  console.log(jsonString);
  //store JSON in localStorage, prepend unixtime in key for sorting
  localStorage.setItem("form_" + jsonForm.ID, jsonString);
  //show note that save was successful
  document.getElementById("SaveConfirmationText").innerHTML = "Saved!";
  //attempt to POST JSON to api
  uploadFormEntries();
}

//serialize form fields into json object and return
function serializeForm() {
  //radios require a bit extra js to extract data
  var radioValue;
  var radios = document.getElementsByName("radioss");
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      radioValue = radios[i].value;
      // only one radio can be logically checked, don't check the rest
      break;
    }
  }

  return {
    ID: document.getElementById("uuid").value,
    Uploaded: false,
    CreationTime: Date.now(),
    ScoutName: document.getElementById("nameInput").value,
    TeamNumber: Number(document.getElementById("teamNumberInput").value),
    Dropdown: document.getElementById("exampleRecipientInput").value,
    TextBox: document.getElementById("textBoxInput").value,
    Check1: document.getElementById("checkBox1").checked,
    Check2: document.getElementById("checkBox2").checked,
    Radio: radioValue,
  };
}

// extract array of form objects from localStorage
function getStoredForms() {
  // get list of all items in localStorage
  keys = Object.keys(localStorage);
  formArray = [];
  for (var i = 0; i < keys.length; i++) {
    // only list items that are form_ entries
    if (keys[i].slice(0, 5) == "form_") {
      formArray.push(JSON.parse(localStorage.getItem(keys[i])));
    }
  }
  return formArray;
}

// builds html table for sync page containing sync items and their sync status
function generateSyncStatusList() {
  // get list of all items in localStorage
  var itemList = getStoredForms();
  // show empty message if theres no items to list
  if (itemList.length == 0) {
    document.getElementById("empty-page-text").removeAttribute("hidden");
    document.getElementById("status-list").setAttribute("hidden", true);
    return;
  } else {
    document.getElementById("empty-page-text").setAttribute("hidden", true);
    document.getElementById("status-list").removeAttribute("hidden");
  }
  // sort list prioritizing non-uploaded at the top
  itemList.sort((a, b) => a.Uploaded - b.Uploaded);
  // clear existing list and rebuild html table
  document.getElementById("status-item-list").innerHTML = "";
  for (var i = 0; i < itemList.length; i++) {
    var item = itemList[i];
    var uploadStatus = item.Uploaded ? "&#x2705" : "&#x274C"; //emojis for status symbols ✅ ❌
    var listItemHtml =
      `<div class="row">
        <li class="one columns" style="margin: 0px;"></li>
        <div class="two columns" style="margin: 0px;">` +
      item.TeamNumber +
      `&nbsp</div>
        <div class="three columns" style="margin: 0px;">` +
      item.Dropdown +
      `&nbsp</div>
        <div class="three columns" style="margin: 0px;">` +
      item.TextBox +
      `&nbsp</div>
        <div class="two columns" style="margin: 0px;">` +
      item.Radio +
      `&nbsp</div>
        <div class="one columns u-pull-right" style="margin: 0px;" id="statusIcon">` +
      uploadStatus +
      `</div>
      </div>
      <hr style="margin:7px;"></hr>`;

    document.getElementById("status-item-list").innerHTML += listItemHtml;
  }
}
