// dummyJobs.ts

export const dummyJobs = [

  {
    id: "1",

    customerName: "Rahul Sharma",
    phone: "9876543210",

    vehicleType: "4 Wheeler",
    vehicleNumber: "MH12AB1234",
    vehicleModel: "Hyundai i20",

    status: "pending",

    services: [
      {
        name: "Engine Oil Change",
        estimatedPrice: 2500
      },
      {
        name: "Wheel Alignment",
        estimatedPrice: 800
      }
    ]
  },

  {
    id: "2",

    customerName: "Amit Verma",
    phone: "9999999999",

    vehicleType: "2 Wheeler",
    vehicleNumber: "CG04XY7788",
    vehicleModel: "Honda Activa 6G",

    status: "progress",

    services: [
      {
        name: "Brake Service",
        estimatedPrice: 600
      },
      {
        name: "General Service",
        estimatedPrice: 1200
      }
    ]
  },

  {
    id: "3",

    customerName: "Vikas Patel",
    phone: "8888888888",

    vehicleType: "4 Wheeler",
    vehicleNumber: "MP09TT4500",
    vehicleModel: "Maruti Swift",

    status: "completed",

    services: [
      {
        name: "AC Repair",
        estimatedPrice: 3500,
        actualPrice: 4000
      },
      {
        name: "Battery Replacement",
        estimatedPrice: 4500,
        actualPrice: 4500
      }
    ]
  },

  {
    id: "4",

    customerName: "Sanjay Kumar",
    phone: "7777777777",

    vehicleType: "2 Wheeler",
    vehicleNumber: "RJ14AA1122",
    vehicleModel: "Royal Enfield Classic 350",

    status: "pending",

    services: [
      {
        name: "Chain Cleaning",
        estimatedPrice: 400
      },
      {
        name: "Full Bike Service",
        estimatedPrice: 1800
      }
    ]
  }

]