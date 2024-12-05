// script.js

console.log("Script.js is loading...");

// Firebase configuration
// Please replace the placeholders with your actual Firebase project details
var firebaseConfig = {
  apiKey: "AIzaSyDEICJygAHllEpGKnnEoJigsJt2tixSc9k", // Replace with your Firebase API key
  authDomain: "ratelistapp-8adab.firebaseapp.com", // Replace with your Firebase Auth domain
  projectId: "ratelistapp-8adab", // Replace with your Firebase Project ID
  storageBucket: "ratelistapp-8adab.firebasestorage.app", // Replace with your Firebase Storage Bucket
  messagingSenderId: "744146022111", // Replace with your Firebase Messaging Sender ID
  appId: "1:744146022111:web:98a10a584bbd5ec4f4c36a", // Replace with your Firebase App ID
  measurementId: "G-9MLYL436C3" // Replace with your Firebase Measurement ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();
var auth = firebase.auth();

// Global Variables
var currentUser = null;
var itemsCollection = null;
var recycleBinCollection = null;
var userSettingsDoc = null;

// DOM Elements
// Authentication Elements
var loginPage = document.getElementById('login-page');
var registerPage = document.getElementById('register-page');
var mainApp = document.getElementById('main-app');
var loginEmail = document.getElementById('login-email');
var loginPassword = document.getElementById('login-password');
var loginBtn = document.getElementById('login-btn');
var rememberMeCheckbox = document.getElementById('remember-me');
var showRegisterLink = document.getElementById('show-register');
var registerUsername = document.getElementById('register-username');
var registerEmail = document.getElementById('register-email');
var registerPassword = document.getElementById('register-password');
var registerConfirmPassword = document.getElementById('register-confirm-password');
var registerBtn = document.getElementById('register-btn');
var showLoginLink = document.getElementById('show-login');

// Sidebar Elements
var sidebarMenu = document.getElementById('sidebar-menu');
var sidebarButton = document.getElementById('sidebar-button');
var closeSidebarBtn = document.getElementById('close-sidebar');
var changeUsernameBtn = document.getElementById('change-username-btn');
var changePasswordBtn = document.getElementById('change-password-btn');
var logoutBtn = document.getElementById('logout-btn');
var decreaseTextSizeBtn = document.getElementById('decrease-text-size');
var increaseTextSizeBtn = document.getElementById('increase-text-size');

// Change Username Modal Elements
var changeUsernameModal = document.getElementById('change-username-modal');
var closeChangeUsernameModalBtn = document.getElementById('close-change-username-modal');
var newUsernameInput = document.getElementById('new-username');
var saveNewUsernameBtn = document.getElementById('save-new-username-btn');

// Change Password Modal Elements
var changePasswordModal = document.getElementById('change-password-modal');
var closeChangePasswordModalBtn = document.getElementById('close-change-password-modal');
var currentPasswordInput = document.getElementById('current-password');
var newPasswordInput = document.getElementById('new-password');
var confirmNewPasswordInput = document.getElementById('confirm-new-password');
var saveNewPasswordBtn = document.getElementById('save-new-password-btn');

// Main App Elements
var itemNameInput = document.getElementById('item-name');
var itemPriceInput = document.getElementById('item-price');
var saveBtn = document.getElementById('save-btn');
var itemList = document.getElementById('item-list');
var searchInput = document.getElementById('search-input');
var searchBtn = document.getElementById('search-btn');
var backupBtn = document.getElementById('backup-btn');
var restoreBtn = document.getElementById('restore-btn');
var clearDataBtn = document.getElementById('clear-data-btn');
var multiDeleteBtn = document.getElementById('multi-delete-btn');
var recycleBinBtn = document.getElementById('recycle-bin-btn');
var restoreFileInput = document.getElementById('restore-file-input');
var menuButton = document.getElementById('menu-button');
var menuOptions = document.getElementById('menu-options');
var autoBackupSettingsBtn = document.getElementById('auto-backup-settings-btn');

// Modals
var editModal = document.getElementById('edit-modal');
var closeEditModalBtn = document.getElementById('close-edit-modal');
var editItemNameInput = document.getElementById('edit-item-name');
var editItemPriceInput = document.getElementById('edit-item-price');
var saveEditBtn = document.getElementById('save-edit-btn');

var recycleBinModal = document.getElementById('recycle-bin-modal');
var closeRecycleBinModalBtn = document.getElementById('close-recycle-bin-modal');
var recycleBinList = document.getElementById('recycle-bin-list');
var restoreSelectedBtn = document.getElementById('restore-selected-btn');
var emptyBinBtn = document.getElementById('empty-bin-btn');

var multiDeleteModal = document.getElementById('multi-delete-modal');
var closeMultiDeleteModalBtn = document.getElementById('close-multi-delete-modal');
var multiDeleteItemList = document.getElementById('multi-delete-item-list');
var selectAllBtn = document.getElementById('select-all-btn');
var selectNoneBtn = document.getElementById('select-none-btn');
var multiDeleteConfirmBtn = document.getElementById('multi-delete-confirm-btn');

var autoBackupModal = document.getElementById('auto-backup-modal');
var closeAutoBackupModalBtn = document.getElementById('close-auto-backup-modal');
var autoBackupToggle = document.getElementById('auto-backup-toggle');
var backupScheduleContainer = document.getElementById('backup-schedule-container');
var saveAutoBackupSettingsBtn = document.getElementById('save-auto-backup-settings-btn');
var daysCheckboxes = autoBackupModal.querySelectorAll('.days-checkboxes input[type="checkbox"]');

// Auto Backup Settings (Now per user)
var autoBackupSettings = {
  enabled: true,
  scheduledDays: []
};

// Text Size Preference
var textSizePreference = 'normal'; // 'small', 'normal', 'large'

// Authentication State Listener
auth.onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user;
    console.log('User is logged in:', user.email);
    initializeAppForUser();
  } else {
    currentUser = null;
    console.log('No user is logged in.');
    showLoginPage();
  }
});

// Function to Initialize App for Logged-in User
function initializeAppForUser() {
  // Set up Firestore references
  itemsCollection = db.collection('users').doc(currentUser.uid).collection('items');
  recycleBinCollection = db.collection('users').doc(currentUser.uid).collection('recycleBin');
  userSettingsDoc = db.collection('users').doc(currentUser.uid);

  // Load User Settings and then initialize the app
  loadUserSettings().then(function() {
    // Initialize Listeners
    listenToItems();
    listenToRecycleBin();

    // Show Main App
    loginPage.classList.add('hidden');
    registerPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
  }).catch(function(error) {
    console.error("Error initializing app for user:", error);
    alert('Failed to initialize app. Please try again.');
  });
}

// Function to Load User Settings
function loadUserSettings() {
  return userSettingsDoc.get()
    .then(function(doc) {
      if (doc.exists) {
        var settings = doc.data();
        autoBackupSettings = settings.autoBackupSettings || autoBackupSettings;
        textSizePreference = settings.textSizePreference || 'normal';

        // Apply Text Size Preference
        applyTextSizePreference();

        console.log('User settings loaded:', settings);
      } else {
        // No settings found, use defaults
        console.log('No user settings found, using defaults.');
      }

      // Initialize Auto Backup
      initializeAutoBackupSettings();
    })
    .catch(function(error) {
      console.error("Error loading user settings:", error);
    });
}

// Function to Apply Text Size Preference
function applyTextSizePreference() {
  document.body.classList.remove('small-text', 'large-text');
  if (textSizePreference === 'small') {
    document.body.classList.add('small-text');
  } else if (textSizePreference === 'large') {
    document.body.classList.add('large-text');
  }
}

// Login Functionality
loginBtn.addEventListener('click', function() {
  var email = loginEmail.value.trim();
  var password = loginPassword.value;

  if (email && password) {
    var persistence = rememberMeCheckbox.checked ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
    auth.setPersistence(persistence)
      .then(function() {
        return auth.signInWithEmailAndPassword(email, password);
      })
      .catch(function(error) {
        console.error("Error during login:", error);
        alert(error.message);
      });
  } else {
    alert('Please enter email and password.');
  }
});

// Registration Functionality
registerBtn.addEventListener('click', function() {
  var username = registerUsername.value.trim();
  var email = registerEmail.value.trim();
  var password = registerPassword.value;
  var confirmPassword = registerConfirmPassword.value;

  if (!username || !email || !password || !confirmPassword) {
    alert('Please fill in all fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(function(userCredential) {
      var user = userCredential.user;
      return user.updateProfile({ displayName: username });
    })
    .then(function() {
      console.log('User registered and username set:', username);
    })
    .catch(function(error) {
      console.error("Error during registration:", error);
      alert(error.message);
    });
});

// Show Register Page
showRegisterLink.addEventListener('click', function(e) {
  e.preventDefault();
  loginPage.classList.add('hidden');
  registerPage.classList.remove('hidden');
});

// Show Login Page
showLoginLink.addEventListener('click', function(e) {
  e.preventDefault();
  registerPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
});

// Logout Functionality
logoutBtn.addEventListener('click', function() {
  auth.signOut()
    .then(function() {
      console.log('User logged out.');
      sidebarMenu.classList.add('hidden');
      document.body.classList.remove('sidebar-open');
      showLoginPage();
    })
    .catch(function(error) {
      console.error("Error during logout:", error);
    });
});

// Show Login Page Function
function showLoginPage() {
  mainApp.classList.add('hidden');
  registerPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
  // Clear input fields
  loginEmail.value = '';
  loginPassword.value = '';
  rememberMeCheckbox.checked = false;
}

// Text Size Adjustment Functionality
increaseTextSizeBtn.addEventListener('click', function() {
  if (textSizePreference === 'normal') {
    textSizePreference = 'large';
  } else if (textSizePreference === 'small') {
    textSizePreference = 'normal';
  }
  applyTextSizePreference();
  saveTextSizePreference();
});

decreaseTextSizeBtn.addEventListener('click', function() {
  if (textSizePreference === 'normal') {
    textSizePreference = 'small';
  } else if (textSizePreference === 'large') {
    textSizePreference = 'normal';
  }
  applyTextSizePreference();
  saveTextSizePreference();
});

function saveTextSizePreference() {
  userSettingsDoc.set({ textSizePreference: textSizePreference }, { merge: true })
    .then(function() {
      console.log('Text size preference saved:', textSizePreference);
    })
    .catch(function(error) {
      console.error("Error saving text size preference:", error);
    });
}

// Sidebar Menu Functionality
sidebarButton.addEventListener('click', function() {
  sidebarMenu.classList.remove('hidden');
  document.body.classList.add('sidebar-open');
});

closeSidebarBtn.addEventListener('click', function() {
  sidebarMenu.classList.add('hidden');
  document.body.classList.remove('sidebar-open');
});

// Change Username Functionality
changeUsernameBtn.addEventListener('click', function() {
  changeUsernameModal.classList.remove('hidden');
});

closeChangeUsernameModalBtn.addEventListener('click', function() {
  changeUsernameModal.classList.add('hidden');
});

saveNewUsernameBtn.addEventListener('click', function() {
  var newUsername = newUsernameInput.value.trim();
  if (newUsername) {
    currentUser.updateProfile({ displayName: newUsername })
      .then(function() {
        alert('Username updated successfully!');
        newUsernameInput.value = '';
        changeUsernameModal.classList.add('hidden');
        console.log('Username updated to:', newUsername);
      })
      .catch(function(error) {
        console.error("Error updating username:", error);
        alert('Failed to update username. Please try again.');
      });
  } else {
    alert('Please enter a new username.');
  }
});

// Change Password Functionality
changePasswordBtn.addEventListener('click', function() {
  changePasswordModal.classList.remove('hidden');
});

closeChangePasswordModalBtn.addEventListener('click', function() {
  changePasswordModal.classList.add('hidden');
});

saveNewPasswordBtn.addEventListener('click', function() {
  var currentPassword = currentPasswordInput.value;
  var newPassword = newPasswordInput.value;
  var confirmNewPassword = confirmNewPasswordInput.value;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    alert('Please fill in all fields.');
    return;
  }

  if (newPassword !== confirmNewPassword) {
    alert('New passwords do not match.');
    return;
  }

  // Re-authenticate user
  var credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
  currentUser.reauthenticateWithCredential(credential)
    .then(function() {
      return currentUser.updatePassword(newPassword);
    })
    .then(function() {
      alert('Password updated successfully!');
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmNewPasswordInput.value = '';
      changePasswordModal.classList.add('hidden');
      console.log('Password updated.');
    })
    .catch(function(error) {
      console.error("Error updating password:", error);
      alert(error.message);
    });
});

// Function to Render Items
function renderItems(itemsToRender) {
  itemList.innerHTML = '';
  itemsToRender.forEach(function(item) {
    var li = document.createElement('li');
    li.setAttribute('data-index', item.id);

    var itemNameSpan = document.createElement('span');
    itemNameSpan.classList.add('item-name');
    itemNameSpan.textContent = item.name + ' - ₹' + item.price;
    li.appendChild(itemNameSpan);

    var itemOptions = document.createElement('div');
    itemOptions.classList.add('item-options');
    itemOptions.innerHTML = '<button class="edit-item-btn">Edit Item</button><button class="delete-item-btn">Delete Item</button>';
    li.appendChild(itemOptions);

    itemList.appendChild(li);
  });
}

// Function to Render Recycle Bin Items
function renderRecycleBin(binItems) {
  recycleBinList.innerHTML = '';
  binItems.forEach(function(item) {
    var li = document.createElement('li');
    li.innerHTML = '<input type="checkbox" data-id="' + item.id + '"><label>' + item.name + ' - ₹' + item.price + '</label>';
    recycleBinList.appendChild(li);
  });
}

// Listen to Firestore Items Collection
function listenToItems() {
  itemsCollection.orderBy('timestamp', 'desc').onSnapshot(function(snapshot) {
    var items = [];
    snapshot.forEach(function(doc) {
      items.push({ id: doc.id, ...doc.data() });
    });
    renderItems(items);
  }, function(error) {
    console.error("Error fetching items:", error);
    alert('Failed to fetch items. Please try again.');
  });
}

// Listen to Firestore Recycle Bin Collection
function listenToRecycleBin() {
  recycleBinCollection.orderBy('timestamp', 'desc').onSnapshot(function(snapshot) {
    var binItems = [];
    snapshot.forEach(function(doc) {
      binItems.push({ id: doc.id, ...doc.data() });
    });
    renderRecycleBin(binItems);
  }, function(error) {
    console.error("Error fetching recycle bin items:", error);
    alert('Failed to fetch recycle bin items. Please try again.');
  });
}

// Event Listener: Save Button
saveBtn.addEventListener('click', function() {
  var itemName = itemNameInput.value.trim();
  var itemPrice = itemPriceInput.value.trim();

  if (itemName && itemPrice) {
    var priceNumber = parseFloat(itemPrice);
    if (isNaN(priceNumber) || priceNumber < 0) {
      alert('Please enter a valid non-negative number for price.');
      return;
    }

    itemsCollection.add({
      name: itemName,
      price: priceNumber,
      nameLower: itemName.toLowerCase(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function() {
      itemNameInput.value = '';
      itemPriceInput.value = '';
      console.log('Item added:', itemName, priceNumber);
    })
    .catch(function(error) {
      console.error("Error adding item:", error);
      alert('Failed to add item. Please try again.');
    });
  } else {
    alert('Please enter both item name and price.');
  }
});

// Event Listener: Search Button
searchBtn.addEventListener('click', function() {
  var searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm === '') {
    listenToItems(); // Show all items
    return;
  }

  var queryRef = itemsCollection
    .where('nameLower', '>=', searchTerm)
    .where('nameLower', '<=', searchTerm + '\uf8ff')
    .orderBy('nameLower');

  queryRef.get()
    .then(function(snapshot) {
      var filteredItems = [];
      snapshot.forEach(function(doc) {
        filteredItems.push({ id: doc.id, ...doc.data() });
      });
      renderItems(filteredItems);
      console.log('Search completed for term:', searchTerm);
    })
    .catch(function(error) {
      console.error("Error searching items:", error);
      alert('Failed to search items. Please try again.');
    });
});

// Event Listener: Enter Key for Search Input
searchInput.addEventListener('keyup', function(e) {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// Event Listener: Menu Button
menuButton.addEventListener('click', function(e) {
  e.stopPropagation();
  menuOptions.classList.toggle('hidden');
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
  if (!menuButton.contains(e.target) && !menuOptions.contains(e.target)) {
    menuOptions.classList.add('hidden');
  }
});

// Event Listener: Backup Button (Manual Backup)
backupBtn.addEventListener('click', function() {
  menuOptions.classList.add('hidden');
  manualBackup();
});

// Function: Manual Backup
function manualBackup() {
  itemsCollection.get()
    .then(function(snapshot) {
      var data = [];
      snapshot.forEach(function(doc) {
        data.push({ id: doc.id, ...doc.data() });
      });
      var fileName = prompt('Enter backup file name:', 'rate_list_backup');
      if (fileName === null) return;

      var validFileName = fileName.trim().replace(/[^a-zA-Z0-9-_]/g, '_');
      if (validFileName === '') {
        alert('Invalid file name.');
        return;
      }

      var dataStr = JSON.stringify(data, null, 2);
      var blob = new Blob([dataStr], { type: "application/json" });
      var url = URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.href = url;
      a.download = validFileName + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Manual backup downloaded as:', validFileName + ".json");
    })
    .catch(function(error) {
      console.error("Error during manual backup:", error);
      alert('Failed to backup data. Please try again.');
    });
}

// Function: Automatic Backup
function autoBackup() {
  if (!autoBackupSettings.enabled) return;

  var date = new Date();
  var day = date.getDay(); // 0 (Sun) to 6 (Sat)

  // Check if today is a scheduled backup day
  if (autoBackupSettings.scheduledDays.length > 0 && autoBackupSettings.scheduledDays.indexOf(day) === -1) {
    console.log('Auto backup skipped for today.');
    return;
  }

  itemsCollection.get()
    .then(function(snapshot) {
      var data = [];
      snapshot.forEach(function(doc) {
        data.push({ id: doc.id, ...doc.data() });
      });

      // Save backup data to localStorage
      var dateString = date.toISOString().replace(/[:.]/g, '-');
      var backupKey = 'auto_backup_rate_list_app_' + dateString;
      localStorage.setItem(backupKey, JSON.stringify(data));

      console.log('Automatic backup saved to localStorage as:', backupKey);
    })
    .catch(function(error) {
      console.error("Error during automatic backup:", error);
    });
}

// Schedule Automatic Backups
function initializeAutoBackupSettings() {
  // Schedule automatic backups based on settings
  setInterval(function() {
    scheduleAutoBackup();
  }, 60 * 60 * 1000); // Check every hour

  // Initial check after some delay to prevent interference with login
  setTimeout(function() {
    scheduleAutoBackup();
  }, 5000);
}

function scheduleAutoBackup() {
  if (!autoBackupSettings.enabled) return;

  var now = new Date();
  var currentDay = now.getDay();

  if (autoBackupSettings.scheduledDays.length === 0 || autoBackupSettings.scheduledDays.indexOf(currentDay) !== -1) {
    autoBackup();
  }
}

// Event Listener: Restore Button
restoreBtn.addEventListener('click', function() {
  menuOptions.classList.add('hidden');
  restoreFileInput.click();
});

// Event Listener: Restore File Input Change
restoreFileInput.addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(event) {
    try {
      var importedData = JSON.parse(event.target.result);
      if (Array.isArray(importedData) && importedData.every(function(item) { return 'name' in item && 'price' in item; })) {
        var confirmRestore = confirm('Do you want to overwrite the current data with the backup?');
        if (confirmRestore) {
          // Clear existing items
          itemsCollection.get()
            .then(function(snapshot) {
              var batch = db.batch();
              snapshot.forEach(function(doc) {
                batch.delete(doc.ref);
              });
              return batch.commit();
            })
            .then(function() {
              // Add imported items
              var batchAdd = db.batch();
              importedData.forEach(function(item) {
                var docRef = itemsCollection.doc();
                batchAdd.set(docRef, {
                  name: item.name,
                  price: item.price,
                  nameLower: item.name.toLowerCase(),
                  timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
              });
              return batchAdd.commit();
            })
            .then(function() {
              alert('Data restored successfully!');
              console.log('Data restored from backup.');
            })
            .catch(function(error) {
              console.error("Error during restore:", error);
              alert('Failed to restore data. Please try again.');
            });
        }
      } else {
        alert('Invalid backup file format.');
      }
    } catch (error) {
      alert('Failed to parse the backup file.');
      console.error(error);
    }
  };
  reader.readAsText(file);
});

// Event Listener: Clear Data Button
clearDataBtn.addEventListener('click', function() {
  menuOptions.classList.add('hidden');
  var confirmed = confirm('Are you sure you want to clear all data? This cannot be undone.');
  if (confirmed) {
    // Clear items
    itemsCollection.get()
      .then(function(snapshot) {
        var batch = db.batch();
        snapshot.forEach(function(doc) {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
      .then(function() {
        alert('All data cleared.');
        console.log('All data cleared.');
      })
      .catch(function(error) {
        console.error("Error clearing data:", error);
        alert('Failed to clear data.');
      });
  }
});

// Event Listener: Multi Delete Button
multiDeleteBtn.addEventListener('click', function() {
  menuOptions.classList.add('hidden');
  openMultiDeleteModal();
});

// Function: Open Multi Delete Modal
function openMultiDeleteModal() {
  populateMultiDeleteModal();
  multiDeleteModal.classList.remove('hidden');
}

// Function: Close Multi Delete Modal
function closeMultiDeleteModal() {
  multiDeleteModal.classList.add('hidden');
}

closeMultiDeleteModalBtn.addEventListener('click', closeMultiDeleteModal);

// Function: Populate Multi Delete Modal
function populateMultiDeleteModal() {
  multiDeleteItemList.innerHTML = '';
  itemsCollection.get()
    .then(function(snapshot) {
      if (snapshot.empty) {
        multiDeleteItemList.innerHTML = '<li>No items available for deletion.</li>';
        multiDeleteConfirmBtn.disabled = true;
        return;
      }
      multiDeleteConfirmBtn.disabled = false;
      snapshot.forEach(function(doc) {
        var item = doc.data();
        var li = document.createElement('li');
        li.innerHTML = '<input type="checkbox" data-id="' + doc.id + '"><label>' + item.name + ' - ₹' + item.price + '</label>';
        multiDeleteItemList.appendChild(li);
      });
    })
    .catch(function(error) {
      console.error("Error fetching items for multi delete:", error);
      alert('Failed to load items for multi delete. Please try again.');
    });
}

// Event Listener: Select All Button
selectAllBtn.addEventListener('click', function() {
  var checkboxes = multiDeleteItemList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(function(cb) { cb.checked = true; });
});

// Event Listener: Select None Button
selectNoneBtn.addEventListener('click', function() {
  var checkboxes = multiDeleteItemList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(function(cb) { cb.checked = false; });
});

// Event Listener: Delete Selected Items Button in Multi Delete Modal
multiDeleteConfirmBtn.addEventListener('click', function() {
  var checkboxes = multiDeleteItemList.querySelectorAll('input[type="checkbox"]:checked');
  if (checkboxes.length === 0) {
    alert('No items selected for deletion.');
    return;
  }

  var confirmed = confirm('Are you sure you want to delete ' + checkboxes.length + ' selected item(s)? They will be moved to the recycle bin.');
  if (!confirmed) return;

  var promises = [];
  checkboxes.forEach(function(cb) {
    var itemId = cb.getAttribute('data-id');
    var itemDocRef = itemsCollection.doc(itemId);
    promises.push(
      itemDocRef.get()
        .then(function(docSnap) {
          if (docSnap.exists) {
            var itemData = docSnap.data();
            // Add to recycle bin
            return recycleBinCollection.add({
              name: itemData.name,
              price: itemData.price,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(function() {
              // Delete from items
              return itemDocRef.delete();
            });
          }
        })
    );
  });

  Promise.all(promises)
    .then(function() {
      alert('Selected items moved to recycle bin.');
      console.log('Items moved to recycle bin.');
    })
    .catch(function(error) {
      console.error("Error during multi-delete:", error);
      alert('Failed to delete some items.');
    });

  closeMultiDeleteModal();
});

// Event Listener: Recycle Bin Button
recycleBinBtn.addEventListener('click', function() {
  menuOptions.classList.add('hidden');
  openRecycleBinModal();
});

// Function: Open Recycle Bin Modal
function openRecycleBinModal() {
  populateRecycleBinModal();
  recycleBinModal.classList.remove('hidden');
}

// Function: Close Recycle Bin Modal
function closeRecycleBinModal() {
  recycleBinModal.classList.add('hidden');
}

closeRecycleBinModalBtn.addEventListener('click', closeRecycleBinModal);

// Function: Populate Recycle Bin Modal
function populateRecycleBinModal() {
  recycleBinList.innerHTML = '';
  recycleBinCollection.get()
    .then(function(snapshot) {
      if (snapshot.empty) {
        recycleBinList.innerHTML = '<li>No items in recycle bin.</li>';
        restoreSelectedBtn.disabled = true;
        emptyBinBtn.disabled = true;
        return;
      }
      restoreSelectedBtn.disabled = false;
      emptyBinBtn.disabled = false;
      snapshot.forEach(function(doc) {
        var item = doc.data();
        var li = document.createElement('li');
        li.innerHTML = '<input type="checkbox" data-id="' + doc.id + '"><label>' + item.name + ' - ₹' + item.price + '</label>';
        recycleBinList.appendChild(li);
      });
    })
    .catch(function(error) {
      console.error("Error fetching recycle bin items:", error);
      alert('Failed to load recycle bin items. Please try again.');
    });
}

// Restore Selected Items Button
restoreSelectedBtn.addEventListener('click', function() {
  var checkboxes = recycleBinList.querySelectorAll('input[type="checkbox"]:checked');
  if (checkboxes.length === 0) {
    alert('No items selected for restoration.');
    return;
  }

  var confirmed = confirm('Are you sure you want to restore ' + checkboxes.length + ' selected item(s)?');
  if (!confirmed) return;

  var promises = [];
  checkboxes.forEach(function(cb) {
    var binItemId = cb.getAttribute('data-id');
    var binItemDocRef = recycleBinCollection.doc(binItemId);
    promises.push(
      binItemDocRef.get()
        .then(function(docSnap) {
          if (docSnap.exists) {
            var itemData = docSnap.data();
            // Add to items
            return itemsCollection.add({
              name: itemData.name,
              price: itemData.price,
              nameLower: itemData.name.toLowerCase(),
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(function() {
              // Delete from recycle bin
              return binItemDocRef.delete();
            });
          }
        })
    );
  });

  Promise.all(promises)
    .then(function() {
      alert('Selected items restored.');
      console.log('Items restored from recycle bin.');
    })
    .catch(function(error) {
      console.error("Error restoring items:", error);
      alert('Failed to restore some items.');
    });
});

// Empty Bin Button
emptyBinBtn.addEventListener('click', function() {
  var confirmed = confirm('Are you sure you want to permanently delete all items in the recycle bin? This cannot be undone.');
  if (!confirmed) return;

  recycleBinCollection.get()
    .then(function(snapshot) {
      var batch = db.batch();
      snapshot.forEach(function(doc) {
        batch.delete(doc.ref);
      });
      return batch.commit();
    })
    .then(function() {
      alert('Recycle bin emptied.');
      console.log('Recycle bin emptied.');
    })
    .catch(function(error) {
      console.error("Error emptying recycle bin:", error);
      alert('Failed to empty recycle bin. Please try again.');
    });
});

// Event Listener: Item Name Click (Show Options)
itemList.addEventListener('click', function(e) {
  var li = e.target.closest('li');
  if (!li) return;

  if (e.target.classList.contains('item-name')) {
    // Hide other item options
    var allItems = itemList.querySelectorAll('li');
    allItems.forEach(function(item) {
      if (item !== li) {
        item.classList.remove('show-options');
      }
    });
    li.classList.toggle('show-options');
  } else if (e.target.classList.contains('edit-item-btn')) {
    var itemId = li.getAttribute('data-index');
    openEditModal(itemId);
    li.classList.remove('show-options');
  } else if (e.target.classList.contains('delete-item-btn')) {
    var itemId = li.getAttribute('data-index');
    deleteItem(itemId);
    li.classList.remove('show-options');
  }
});

// Function to Open Edit Modal
var currentEditIndex = null; // Track the current item being edited

function openEditModal(itemId) {
  itemsCollection.doc(itemId).get()
    .then(function(docSnap) {
      if (docSnap.exists) {
        currentEditIndex = itemId;
        editItemNameInput.value = docSnap.data().name;
        editItemPriceInput.value = docSnap.data().price;
        editModal.classList.remove('hidden');
        console.log('Editing item:', docSnap.data().name);
      } else {
        alert('Item not found.');
      }
    })
    .catch(function(error) {
      console.error("Error fetching item for edit:", error);
      alert('Failed to fetch item details.');
    });
}

// Event Listener: Close Edit Modal
closeEditModalBtn.addEventListener('click', function() {
  editModal.classList.add('hidden');
});

// Event Listener: Save Edit Button
saveEditBtn.addEventListener('click', function() {
  var newName = editItemNameInput.value.trim();
  var newPrice = editItemPriceInput.value.trim();

  if (newName && newPrice) {
    var priceNumber = parseFloat(newPrice);
    if (isNaN(priceNumber) || priceNumber < 0) {
      alert('Please enter a valid non-negative number for price.');
      return;
    }

    itemsCollection.doc(currentEditIndex).update({
      name: newName,
      price: priceNumber,
      nameLower: newName.toLowerCase(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function() {
      editModal.classList.add('hidden');
      alert('Item updated successfully!');
      console.log('Item updated:', newName, priceNumber);
    })
    .catch(function(error) {
      console.error("Error updating item:", error);
      alert('Failed to update item. Please try again.');
    });
  } else {
    alert('Please enter both item name and price.');
  }
});

// Function to Delete Item
function deleteItem(itemId) {
  var confirmed = confirm('Are you sure you want to delete this item? It will be moved to the recycle bin.');
  if (confirmed) {
    itemsCollection.doc(itemId).get()
      .then(function(docSnap) {
        if (docSnap.exists) {
          var itemData = docSnap.data();
          // Add to recycle bin
          return recycleBinCollection.add({
            name: itemData.name,
            price: itemData.price,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          })
          .then(function() {
            // Delete from items
            return itemsCollection.doc(itemId).delete();
          })
          .then(function() {
            alert('Item moved to recycle bin.');
            console.log('Item moved to recycle bin:', itemData.name);
          })
          .catch(function(error) {
            console.error("Error deleting item:", error);
            alert('Failed to delete item. Please try again.');
          });
        } else {
          alert('Item not found.');
        }
      })
      .catch(function(error) {
        console.error("Error fetching item for deletion:", error);
        alert('Failed to delete item. Please try again.');
      });
  }
}

// Event Listener: Auto Backup Settings Button
autoBackupSettingsBtn.addEventListener('click', function() {
  menuOptions.classList.add('hidden');
  openAutoBackupModal();
});

// Function: Open Auto Backup Modal
function openAutoBackupModal() {
  // Set the toggle state
  autoBackupToggle.checked = autoBackupSettings.enabled;
  backupScheduleContainer.classList.toggle('hidden', !autoBackupToggle.checked);

  // Set the scheduled days
  daysCheckboxes.forEach(function(checkbox) {
    checkbox.checked = autoBackupSettings.scheduledDays.indexOf(parseInt(checkbox.value)) !== -1;
  });

  autoBackupModal.classList.remove('hidden');
}

// Event Listener: Close Auto Backup Modal
closeAutoBackupModalBtn.addEventListener('click', function() {
  autoBackupModal.classList.add('hidden');
});

// Event Listener: Auto Backup Toggle
autoBackupToggle.addEventListener('change', function() {
  backupScheduleContainer.classList.toggle('hidden', !autoBackupToggle.checked);
});

// Event Listener: Save Auto Backup Settings Button
saveAutoBackupSettingsBtn.addEventListener('click', function() {
  autoBackupSettings.enabled = autoBackupToggle.checked;
  autoBackupSettings.scheduledDays = Array.prototype.slice.call(daysCheckboxes)
    .filter(function(cb) { return cb.checked; })
    .map(function(cb) { return parseInt(cb.value); });

  // Save to Firestore
  userSettingsDoc.set({ autoBackupSettings: autoBackupSettings }, { merge: true })
    .then(function() {
      alert('Auto backup settings saved.');
      autoBackupModal.classList.add('hidden');
      console.log('Auto backup settings updated:', autoBackupSettings);
    })
    .catch(function(error) {
      console.error("Error saving auto backup settings:", error);
      alert('Failed to save settings. Please try again.');
    });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(function() {
      console.log('Service Worker Registered');
    })
    .catch(function(err) {
      console.log('Service Worker Registration Failed:', err);
    });
}
