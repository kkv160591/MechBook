export const translations = {
  en: {
    // Shared Across Screens
    common: {
      appName: "MechBook",
      loading: "Loading...",
      validationTitle: "Validation",
      successTitle: "Success",
      errorTitle: "Error",
      somethingWentWrong: "Something went wrong",
      cancel: "Cancel",
      save: "Save",
      ok: "OK",
    },

    // GST Configuration
    gstConfig: {
      title: "GST Configuration",
      enableGst: "Enable GST",
      enableGstSub: "Apply GST on invoices",
      gstNumber: "GST Number",
      gstNumberPlaceholder: "Enter 15-digit GST Number",
      defaultRate: "Default GST Rate",
      applyMode: "GST Apply Mode",
      invoiceLevel: "Invoice Level",
      invoiceLevelDesc: "GST applied on total invoice amount",
      lineItemLevel: "Line Item Level",
      lineItemDesc: "GST applied individually to parts/services",
      saveBtn: "Save GST Settings",
      successMsg: "GST settings saved successfully",
      errorMsg: "Failed to save GST settings",
      validation: {
        gstNumberReq: "GST Number is required when GST is enabled",
        gstNumberInvalid: "Enter a valid 15-character Indian GSTIN (e.g., 27AAAAA0000A1Z5)",
      }
    },

    // Service Type
    services: {
      title: "Service Types",
      loading: "Loading Services...",
      noServices: "No Services Added",
      addTitle: "Add Service",
      editTitle: "Edit Service",
      saveService: "Save Service",
      updateService: "Update Service",
      deleteService: "Delete Service",
      addSuccess: "Service added successfully",
      updateSuccess: "Service updated successfully",
      deleteSuccess: "Service deleted successfully",
      addError: "Failed to save service",
      updateError: "Failed to update service",
      deleteError: "Failed to delete service",
      deleteConfirmTitle: "Delete Service",
      deleteConfirmMessage: "Are you sure you want to delete this service?",
      labels: {
        name: "Service Name",
        category: "Category",
        defaultPrice: "Default Price (₹)",
        estimatedDuration: "Duration (e.g. 1 hour, 30 mins)"
      },
      validation: {
        nameReq: "Service name is required",
        categoryReq: "Category is required",
        priceReq: "Default price is required",
        priceValid: "Price must be a valid positive number",
        durationReq: "Duration is required"
      }
    },

    // Garage Profile
    garageProfile: {
      title: "Garage Profile",
      subtitle: "Manage garage information",
      uploadLogo: "Upload Logo",
      sections: {
        info: "Garage Information",
        address: "Address",
        vehicles: "Supported Vehicle Types",
      },
      placeholders: {
        garageName: "Garage Name",
        ownerName: "Owner Name",
        phone: "Phone",
        email: "Email",
        gstNumber: "GST Number",
        address: "Address",
        city: "City",
        state: "State",
        pincode: "Pincode",
      },
      vehicles: {
        twoWheeler: "2 Wheeler",
        fourWheeler: "4 Wheeler",
        commercial: "Commercial",
        truck: "Truck",
        bus: "Bus",
      },
      saveBtn: "Save Profile",
      successMsg: "Garage Profile Updated",
      errorMsg: "Failed to update profile",
    },

    // Login Screen
    login: {
      subtitle: "Garage Management Made Simple",
      phonePlaceholder: "Phone Number",
      pinPlaceholder: "4 Digit PIN",
      loginBtn: "Login",
      registerBtn: "Register Garage",
      validation: {
        enterPhone: "Enter phone number",
        validPhone: "Enter valid 10 digit phone number",
        enterPin: "Enter PIN",
      },
      error: {
        title: "Login Failed",
        default: "Unable to login",
      },
    },

    // Register Screen
    register: {
      title: "Register Your Garage",
      subtitle: "Setup your garage and start managing jobs digitally.",
      ownerProfile: "Garage Owner Profile",
      garageDetails: "Garage Details",
      address: "Address",
      vehicleTypes: "Vehicle Types Supported",
      twoWheeler: "2 Wheeler",
      fourWheeler: "4 Wheeler",
      uploadLogo: "Upload Garage Logo (Optional)",
      submitBtn: "Create Garage Account",
      placeholders: {
        ownerName: "Owner Name",
        mobile: "Mobile Number",
        createPin: "Create 4 Digit PIN",
        confirmPin: "Confirm PIN",
        garageName: "Garage Name",
        gstNumber: "GST Number (Optional)",
        email: "Email (Optional)",
        address1: "Address Line 1",
        address2: "Address Line 2 (Optional)",
        city: "City",
        state: "State",
        pincode: "Pincode",
        country: "Country",
      },
      validation: {
        ownerNameReq: "Owner name is required",
        phoneReq: "Phone number is required",
        phoneValid: "Enter valid 10 digit phone number",
        garageNameReq: "Garage name is required",
        addressReq: "Address is required",
        cityStateReq: "City and State are required",
        pinReq: "PIN is required",
        pinLength: "PIN must be 4 digits",
        pinMismatch: "PIN does not match",
      },
      success: {
        message: "Garage registered successfully",
        loginBtn: "Login Now",
      },
      error: {
        title: "Registration Failed",
      },
    },

    // Worker Management
    workers: {
      title: "Worker Management",
      loading: "Loading workers...",
      noWorkers: "No workers found",
      active: "ACTIVE",
      inactive: "INACTIVE",
      addWorker: "Add Worker",
      saveWorker: "Save Worker",
      editWorker: "Edit Worker",
      changePin: "Change PIN",
      deactivate: "Deactivate Worker",
      activate: "Activate Worker",
      contactInfo: "Contact Information",
      loginActivity: "Recent Login Activity",
      viewHistory: "View Full History",
      addSuccess: "Worker added successfully",
      addError: "Failed to add worker",
      pinUpdated: "PIN updated successfully",
      statusError: "Failed to update worker status",
      placeholders: {
        name: "Worker Name",
        role: "Role (e.g. Mechanic, Electrician)",
        phone: "Phone Number",
        pin: "4 Digit PIN",
        confirmPin: "Confirm PIN",
      },
      validation: {
        nameReq: "Worker name is required",
        roleReq: "Role is required",
        phoneReq: "Phone number is required",
        phoneValid: "Enter a valid 10-digit mobile number",
        pinReq: "4-digit PIN is required",
        pinMatch: "PINs do not match",
      },
    },

    // Settings Screen
    settings: {
      title: "Settings",
      subtitle: "Manage your garage configuration and account",
      sections: {
        garage: "Garage",
        operations: "Operations",
        billing: "Billing & Invoices",
        dataAccount: "Data & Account",
        account: "Account",
      },
      items: {
        garageProfile: {
          title: "Garage Profile",
          subtitle: "Name, address, GST, logo",
        },
        workers: {
          title: "Workers",
          subtitle: "Manage mechanics & staff",
        },
        serviceTypes: {
          title: "Service Types",
          subtitle: "Manage available services",
        },
        gstConfig: {
          title: "GST Configuration",
          subtitle: "Default GST settings",
        },
        invoiceSettings: {
          title: "Invoice Settings",
          subtitle: "PDF & invoice customization",
        },
        backup: {
          title: "Data Backup",
          subtitle: "Cloud backup management",
        },
        plan: {
          title: "Plan & Usage",
          subtitle: "Subscription and usage information",
        },
        language: {
          title: "Language",
          subtitle: "Hindi, Tamil, Telugu etc.",
        },
      },
      logout: {
        title: "Logout",
        subtitle: "Sign out of your MechBook account",
        modalTitle: "Logout",
        modalMessage:
          "Are you sure you want to logout from your MechBook account?",
        confirm: "Logout",
      },
    },
  },

  hi: {
    // Shared Across Screens (Hindi)
    common: {
      appName: "मैकबुक (MechBook)",
      loading: "लोड हो रहा है...",
      validationTitle: "सत्यापन",
      successTitle: "सफलता",
      errorTitle: "त्रुटि",
      somethingWentWrong: "कुछ गलत हो गया",
      cancel: "रद्द करें",
      save: "सहेजें",
      ok: "ठीक है",
    },

    // GST Configuration (Hindi)
    gstConfig: {
      title: "जीएसटी कॉन्फ़िगरेशन",
      enableGst: "जीएसटी सक्षम करें",
      enableGstSub: "चालान पर जीएसटी लागू करें",
      gstNumber: "जीएसटी नंबर",
      gstNumberPlaceholder: "15-अंकों का जीएसटी नंबर दर्ज करें",
      defaultRate: "डिफ़ॉल्ट जीएसटी दर",
      applyMode: "जीएसटी लागू करने का प्रकार",
      invoiceLevel: "इनवॉइस स्तर",
      invoiceLevelDesc: "कुल चालान राशि पर जीएसटी लागू",
      lineItemLevel: "लाइन आइटम स्तर",
      lineItemDesc: "पार्ट्स/सेवाओं पर अलग-अलग जीएसटी लागू",
      saveBtn: "जीएसटी सेटिंग्स सहेजें",
      successMsg: "जीएसटी सेटिंग्स सफलतापूर्वक सहेजी गईं",
      errorMsg: "जीएसटी सेटिंग्स सहेजने में विफल",
      validation: {
        gstNumberReq: "जीएसटी सक्षम होने पर जीएसटी नंबर आवश्यक है",
        gstNumberInvalid: "एक मान्य 15-अंकों का भारतीय GSTIN दर्ज करें (उदा. 27AAAAA0000A1Z5)",
      }
    },

    // Service Type
    services: {
      title: "सेवा के प्रकार",
      loading: "सेवाएं लोड हो रही हैं...",
      noServices: "कोई सेवा नहीं जोड़ी गई",
      addTitle: "सेवा जोड़ें",
      editTitle: "सेवा संपादित करें",
      saveService: "सेवा सहेजें",
      updateService: "सेवा अपडेट करें",
      deleteService: "सेवा हटाएं",
      addSuccess: "सेवा सफलतापूर्वक जोड़ी गई",
      updateSuccess: "सेवा सफलतापूर्वक अपडेट की गई",
      deleteSuccess: "सेवा सफलतापूर्वक हटा दी गई",
      addError: "सेवा सहेजने में विफल",
      updateError: "सेवा अपडेट करने में विफल",
      deleteError: "सेवा हटाने में विफल",
      deleteConfirmTitle: "सेवा हटाएं",
      deleteConfirmMessage: "क्या आप वाकई इस सेवा को हटाना चाहते हैं?",
      labels: {
        name: "सेवा का नाम",
        category: "श्रेणी",
        defaultPrice: "डिफ़ॉल्ट मूल्य (₹)",
        estimatedDuration: "अवधि (जैसे: 1 घंटा, 30 मिनट)"
      },
      validation: {
        nameReq: "सेवा का नाम आवश्यक है",
        categoryReq: "श्रेणी आवश्यक है",
        priceReq: "डिफ़ॉल्ट मूल्य आवश्यक है",
        priceValid: "मूल्य एक अमान्य संख्या नहीं हो सकता",
        durationReq: "अवधि आवश्यक है"
      }
    },

    // Garage Profile (Hindi)
    garageProfile: {
      title: "गैराज प्रोफ़ाइल",
      subtitle: "गैराज की जानकारी प्रबंधित करें",
      uploadLogo: "लोगो अपलोड करें",
      sections: {
        info: "गैराज की जानकारी",
        address: "पता",
        vehicles: "समर्थित वाहन के प्रकार",
      },
      placeholders: {
        garageName: "गैराज का नाम",
        ownerName: "मालिक का नाम",
        phone: "फोन",
        email: "ईमेल",
        gstNumber: "जीएसटी नंबर",
        address: "पता",
        city: "शहर",
        state: "राज्य",
        pincode: "पिनकोड",
      },
      vehicles: {
        twoWheeler: "2 पहिया",
        fourWheeler: "4 पहिया",
        commercial: "कमर्शियल",
        truck: "ट्रक",
        bus: "बस",
      },
      saveBtn: "प्रोफ़ाइल सहेजें",
      successMsg: "गैराज प्रोफ़ाइल अपडेट हो गई",
      errorMsg: "प्रोफ़ाइल अपडेट करने में विफल",
    },

    // Login Screen (Hindi)
    login: {
      subtitle: "गैराज प्रबंधन हुआ आसान",
      phonePlaceholder: "फोन नंबर",
      pinPlaceholder: "4 अंकों का पिन",
      loginBtn: "लॉगिन करें",
      registerBtn: "गैराज पंजीकृत करें",
      validation: {
        enterPhone: "फोन नंबर दर्ज करें",
        validPhone: "अमान्य 10 अंकों का फोन नंबर",
        enterPin: "पिन दर्ज करें",
      },
      error: {
        title: "लॉगिन विफल",
        default: "लॉगिन करने में असमर्थ",
      },
    },

    // Register Screen (Hindi)
    register: {
      title: "अपना गैराज पंजीकृत करें",
      subtitle: "अपना गैराज सेट करें और डिजिटल रूप से काम प्रबंधित करें।",
      ownerProfile: "गैराज मालिक प्रोफ़ाइल",
      garageDetails: "गैराज विवरण",
      address: "पता",
      vehicleTypes: "समर्थित वाहन के प्रकार",
      twoWheeler: "2 पहिया",
      fourWheeler: "4 पहिया",
      uploadLogo: "गैराज लोगो अपलोड करें (वैकल्पिक)",
      submitBtn: "गैराज खाता बनाएं",
      placeholders: {
        ownerName: "मालिक का नाम",
        mobile: "मोबाइल नंबर",
        createPin: "4 अंकों का पिन बनाएं",
        confirmPin: "पिन की पुष्टि करें",
        garageName: "गैराज का नाम",
        gstNumber: "जीएसटी नंबर (वैकल्पिक)",
        email: "ईमेल (वैकल्पिक)",
        address1: "पता पंक्ति 1",
        address2: "पता पंक्ति 2 (वैकल्पिक)",
        city: "शहर",
        state: "राज्य",
        pincode: "पिनकोड",
        country: "देश",
      },
      validation: {
        ownerNameReq: "मालिक का नाम आवश्यक है",
        phoneReq: "फोन नंबर आवश्यक है",
        phoneValid: "अमान्य 10 अंकों का फोन नंबर",
        garageNameReq: "गैराज का नाम आवश्यक है",
        addressReq: "पता आवश्यक है",
        cityStateReq: "शहर और राज्य आवश्यक हैं",
        pinReq: "पिन आवश्यक है",
        pinLength: "पिन 4 अंकों का होना चाहिए",
        pinMismatch: "पिन मेल नहीं खाता",
      },
      success: {
        message: "गैराज सफलतापूर्वक पंजीकृत हो गया",
        loginBtn: "अभी लॉगिन करें",
      },
      error: {
        title: "पंजीकरण विफल",
      },
    },

    // Worker Management (Hindi)
    workers: {
      title: "कर्मचारी प्रबंधन",
      loading: "कर्मचारियों की जानकारी लोड हो रही है...",
      noWorkers: "कोई कर्मचारी नहीं मिला",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      addWorker: "कर्मचारी जोड़ें",
      saveWorker: "कर्मचारी सहेजें",
      editWorker: "कर्मचारी संपादित करें",
      changePin: "पिन बदलें",
      deactivate: "कर्मचारी को निष्क्रिय करें",
      activate: "कर्मचारी को सक्रिय करें",
      contactInfo: "संपर्क जानकारी",
      loginActivity: "हाल की लॉगिन गतिविधि",
      viewHistory: "पूरा इतिहास देखें",
      addSuccess: "कर्मचारी सफलतापूर्वक जोड़ा गया",
      addError: "कर्मचारी जोड़ने में विफल",
      pinUpdated: "पिन सफलतापूर्वक अपडेट किया गया",
      statusError: "कर्मचारी की स्थिति अपडेट करने में विफल",
      placeholders: {
        name: "कर्मचारी का नाम",
        role: "पद (जैसे: मैकेनिक, इलेक्ट्रिशियन)",
        phone: "फोन नंबर",
        pin: "4 अंकों का पिन",
        confirmPin: "पिन की पुष्टि करें",
      },
      validation: {
        nameReq: "कर्मचारी का नाम आवश्यक है",
        roleReq: "पद आवश्यक है",
        phoneReq: "फोन नंबर आवश्यक है",
        phoneValid: "मान्य 10 अंकों का मोबाइल नंबर दर्ज करें",
        pinReq: "4 अंकों का पिन आवश्यक है",
        pinMatch: "पिन मेल नहीं खाता",
      },
    },

    // Settings Screen (Hindi)
    settings: {
      title: "सेटिंग्स",
      subtitle: "अपने गैराज कॉन्फ़िगरेशन और खाते को प्रबंधित करें",
      sections: {
        garage: "गैराज",
        operations: "संचालन",
        billing: "बिलिंग और चालान",
        dataAccount: "डेटा और खाता",
        account: "खाता",
      },
      items: {
        garageProfile: {
          title: "गैराज प्रोफ़ाइल",
          subtitle: "नाम, पता, जीएसटी, लोगो",
        },
        workers: {
          title: "कर्मचारी",
          subtitle: "मैकेनिक और स्टाफ प्रबंधित करें",
        },
        serviceTypes: {
          title: "सेवा के प्रकार",
          subtitle: "उपलब्ध सेवाओं को प्रबंधित करें",
        },
        gstConfig: {
          title: "जीएसटी कॉन्फ़िगरेशन",
          subtitle: "डिफ़ॉल्ट जीएसटी सेटिंग्स",
        },
        invoiceSettings: {
          title: "इनवॉइस सेटिंग्स",
          subtitle: "पीडीएफ और इनवॉइस कस्टमाइजेशन",
        },
        backup: {
          title: "डेटा बैकअप",
          subtitle: "क्लाउड बैकअप प्रबंधन",
        },
        plan: {
          title: "प्लान और उपयोग",
          subtitle: "सदस्यता और उपयोग की जानकारी",
        },
        language: {
          title: "भाषा",
          subtitle: "हिंदी, तमिल, तेलुगु आदि",
        },
      },
      logout: {
        title: "लॉग आउट",
        subtitle: "अपने MechBook खाते से साइन आउट करें",
        modalTitle: "लॉग आउट करें",
        modalMessage:
          "क्या आप वाकई अपने MechBook खाते से लॉग आउट करना चाहते हैं?",
        confirm: "लॉग आउट",
      },
    },
  },
};