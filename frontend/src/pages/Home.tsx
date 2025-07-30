import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dalImage from "../assets/Dal image.jpg";
import { bikeInventoryService } from "../Services/bikeInventoryService";
import type { BikeAvailabilityResponse, BikeBackendResponse } from "../Services/bikeInventoryService";
import { Button } from "@headlessui/react";
import Modal from "../components/modal/modal";
import BookingModalContent, { type BikeModalData, type BookingData } from "./BookingModalContent";
import { useAuth } from "../context/AuthContext";


// Simplified type for display only
interface BikeCardInfo {
  type: string;
  status: string;
  hourlyRate: number;
  sampleId: string;
}

function Home() {
  const [bikes, setBikes] = useState<BikeCardInfo[]>([]);
  const [bikesBackendResponse, setBikesBackendResponse] = useState<BikeAvailabilityResponse | undefined>(undefined);
  const [openModal, setOpenModal] = useState(false);
  const [bikeModalData, setBikeModalData] = useState<Array<BikeModalData> | undefined>(undefined);
  const { authState } = useAuth();
  const user = authState.user // || { username: "testuser" }; // Mock user for development
  
  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const response = await bikeInventoryService.getAvailableBikes();
        setBikesBackendResponse(response);
        if (response.success && response.available_bikes) {
          const transformed = response.available_bikes.map((entry) => {
            const sample = entry.bikes?.[0] as BikeBackendResponse | undefined;
            return {
              type: entry.bike_type,
              status: sample?.status || "Unavailable",
              hourlyRate: sample?.hourlyRate || 0,
              sampleId: sample?.bikeId || Math.random().toString(),
            };
          });
          setBikes(transformed);
        }
      } catch (error) {
        console.error("Error fetching available bikes:", error);
      }
    };

    fetchBikes();
  }, []);

  function handleOpenModal(){
    if(bikesBackendResponse?.available_bikes?.length !== 0) {
      const availableBikes : Array<BikeModalData> = [];
      bikesBackendResponse?.available_bikes?.forEach((bikeType) => {
        if (bikeType.bikes && bikeType.bikes.length > 0) {
          availableBikes.push({
            type: bikeType.bike_type,
            inventory: bikeType.bikes.length,
            label: `${bikeType.bike_type} - ${bikeType.bikes.length} Bikes Available`,
            hourlyRate: bikeType.bikes[0].hourlyRate
          });
        }
      });
      setBikeModalData(availableBikes);
    }
    setOpenModal(true);
  }

  function bookBike(bookingData: BookingData) {
    // console.log("Booking Data:", bookingData);
    //TODO: call the booking service here
    // given here: bikeid, starttime, endtime
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel with Image */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src={dalImage}
          alt="Dalhousie University"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-black/50 to-black/70 pointer-events-none text-white p-8 flex flex-col space-y-3"
          style={{ justifyContent: "center", alignItems: "flex-end" }}
        >
          <h1 className="text-4xl font-bold">DALScooter</h1>
          <p className="text-xl">Sustainable Campus Mobility</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Easy campus transportation</li>
            <li>Eco-friendly & sustainable</li>
            <li>Convenient for students & faculty</li>
          </ul>
        </div>
      </div>

      {/* Right Panel with Bikes */}
      <div className="w-1/2 p-10 flex flex-col">
        <div className="flex justify-end space-x-4 mb-4">
          {user ? '' : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </>
          )}
          
          
        </div>
        <h2 className="text-3xl font-semibold mb-6">Available Bikes</h2>

        <div className="space-y-4">
          {bikes.length > 0 ? (
            bikes.map((bike) => (
              <div
                key={bike.sampleId}
                className="border p-4 rounded shadow-sm bg-gray-50"
              >
                <p className="font-semibold">Type: {bike.type}</p>
                <p>Status: {bike.status}</p>
                <p>Price/hr: ${bike.hourlyRate.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p>No bikes available at this time.</p>
          )}
        </div>
        {
          user ? (
            <Button onClick={handleOpenModal} className="mt-6 w-50 bg-black text-white hover:bg-gray-800">
              Reserve a Bike
            </Button>
          ): ""
        }
        

        <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
          <BookingModalContent data={bikeModalData} onSubmit={bookBike} />
        </Modal>
      </div>
    </div>
  );
}

export default Home;
