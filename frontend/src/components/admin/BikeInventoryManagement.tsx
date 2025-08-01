import React, { useState, useEffect } from 'react';
import { bikeInventoryService, type Bike, type DiscountCode, type BikeCreateRequest, type DiscountCodeCreateRequest, type BikeType } from '../../Services/bikeInventoryService.tsx';

// Frontend form interfaces
interface BikeFormData {
    bikeType: BikeType;
    accessCode: string;
    hourlyRate: number;
    heightAdjustment: boolean;
    batteryLife: number;
    maxSpeed: number;
    weight: number;
    address: string;
    features: string[];
    availability: boolean;
    model: string;
}

interface DiscountFormData {
    code: string;
    discountPercentage: number;
    expiryHours: number;
}

interface BikeInventoryManagementProps {
    // Props can be added as needed
}

const BikeInventoryManagement: React.FC<BikeInventoryManagementProps> = () => {
    const [bikes, setBikes] = useState<Bike[]>([]);
    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'bikes' | 'discounts'>('bikes');

    // Bike form state
    const [showBikeForm, setShowBikeForm] = useState(false);
    const [editingBike, setEditingBike] = useState<Bike | null>(null);
    const [bikeForm, setBikeForm] = useState<BikeFormData>({
        bikeType: 'Gyroscooter',
        accessCode: '',
        hourlyRate: 10,
        heightAdjustment: false,
        batteryLife: 100,
        maxSpeed: 25,
        weight: 15,
        address: 'Dalhousie University, Halifax, NS',
        features: [],
        availability: true,
        model: '',
    });

    // Discount form state
    const [showDiscountForm, setShowDiscountForm] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
    const [discountForm, setDiscountForm] = useState<DiscountFormData>({
        code: '',
        discountPercentage: 5,
        expiryHours: 24,
    });

    // Feature input helper
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        if (activeTab === 'bikes') {
            fetchBikes();
        } else {
            fetchDiscountCodes();
        }
    }, [activeTab]);

    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    // Bike Management Functions
    const fetchBikes = async () => {
        setLoading(true);
        clearMessages();
        try {
            const response = await bikeInventoryService.getBikes();
            if (response.success) {
                setBikes(response.bikes || []);
            } else {
                setError(response.message || 'Failed to fetch bikes');
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching bikes');
        } finally {
            setLoading(false);
        }
    };

    const handleBikeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            // Convert form data to API format
            const bikeData: BikeCreateRequest = {
                bikeType: bikeForm.bikeType,
                accessCode: bikeForm.accessCode,
                hourlyRate: bikeForm.hourlyRate,
                heightAdjustment: bikeForm.heightAdjustment,
                batteryLife: bikeForm.batteryLife,
                maxSpeed: bikeForm.maxSpeed,
                weight: bikeForm.weight,
                address: bikeForm.address,
            };

            let response;
            if (editingBike) {
                response = await bikeInventoryService.updateBike(editingBike.bike_id, {
                    accessCode: bikeData.accessCode,
                    hourlyRate: bikeData.hourlyRate,
                    features: {
                        heightAdjustment: bikeData.heightAdjustment,
                        batteryLife: bikeData.batteryLife,
                        maxSpeed: bikeData.maxSpeed,
                        weight: bikeData.weight,
                    },
                    location: {
                        address: bikeData.address,
                    }
                });
            } else {
                response = await bikeInventoryService.createBike(bikeData);
            }

            if (response.success) {
                setSuccessMessage(editingBike ? 'Bike updated successfully!' : 'Bike created successfully!');
                setShowBikeForm(false);
                setEditingBike(null);
                resetBikeForm();
                fetchBikes();
            } else {
                setError(response.message || 'Failed to save bike');
            }
        } catch (err: any) {
            setError(err.message || 'Error saving bike');
        } finally {
            setLoading(false);
        }
    };

    const resetBikeForm = () => {
        setBikeForm({
            bikeType: 'Gyroscooter',
            accessCode: '',
            hourlyRate: 10,
            heightAdjustment: false,
            batteryLife: 100,
            maxSpeed: 25,
            weight: 15,
            address: 'Dalhousie University, Halifax, NS',
            features: [],
            availability: true,
            model: '',
        });
    };

    const handleEditBike = (bike: Bike) => {
        setEditingBike(bike);
        setBikeForm({
            bikeType: bike.bike_type,
            accessCode: bike.access_code,
            hourlyRate: bike.hourly_rate,
            heightAdjustment: bike.features.includes('Height Adjustment'),
            batteryLife: parseInt(bike.features.find(f => f.includes('Battery Life'))?.split(' ')[2] || '100'),
            maxSpeed: parseInt(bike.features.find(f => f.includes('Max Speed'))?.split(' ')[2] || '25'),
            weight: parseInt(bike.features.find(f => f.includes('Weight'))?.split(' ')[1] || '15'),
            address: bike.location,
            features: bike.features,
            availability: bike.availability,
            model: bike.bike_type, // Use bike type as model
        });
        setShowBikeForm(true);
    };

    const handleDeleteBike = async (bikeId: string) => {
        if (!window.confirm('Are you sure you want to delete this bike?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await bikeInventoryService.deleteBike(bikeId);
            if (response.success) {
                setSuccessMessage('Bike deleted successfully!');
                fetchBikes();
            } else {
                setError(response.message || 'Failed to delete bike');
            }
        } catch (err: any) {
            setError(err.message || 'Error deleting bike');
        } finally {
            setLoading(false);
        }
    };

    const addFeature = () => {
        if (newFeature.trim() && !bikeForm.features.includes(newFeature.trim())) {
            setBikeForm(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (feature: string) => {
        setBikeForm(prev => ({
            ...prev,
            features: prev.features.filter(f => f !== feature)
        }));
    };

    // Discount Code Management Functions
    const fetchDiscountCodes = async () => {
        setLoading(true);
        clearMessages();
        try {
            const response = await bikeInventoryService.getDiscountCodes();
            if (response.success) {
                setDiscountCodes(response.discount_codes || []);
            } else {
                setError(response.message || 'Failed to fetch discount codes');
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching discount codes');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        // Validate business rules
        if (!bikeInventoryService.isValidDiscountPercentage(discountForm.discountPercentage)) {
            setError('Discount percentage must be between 5% and 15%');
            setLoading(false);
            return;
        }

        if (!bikeInventoryService.isValidExpiryHours(discountForm.expiryHours)) {
            setError('Expiry time must be between 0 and 48 hours (0-2 days)');
            setLoading(false);
            return;
        }

        try {
            let response;
            if (editingDiscount) {
                response = await bikeInventoryService.updateDiscountCode(editingDiscount.codeId, {
                    discountPercentage: discountForm.discountPercentage,
                    expiryHours: discountForm.expiryHours,
                });
            } else {
                response = await bikeInventoryService.createDiscountCode(discountForm);
            }

            if (response.success) {
                setSuccessMessage(editingDiscount ? 'Discount code updated successfully!' : 'Discount code created successfully!');
                setShowDiscountForm(false);
                setEditingDiscount(null);
                resetDiscountForm();
                fetchDiscountCodes();
            } else {
                setError(response.message || 'Failed to save discount code');
            }
        } catch (err: any) {
            setError(err.message || 'Error saving discount code');
        } finally {
            setLoading(false);
        }
    };

    const resetDiscountForm = () => {
        setDiscountForm({
            code: '',
            discountPercentage: 5,
            expiryHours: 24,
        });
    };

    const handleEditDiscount = (discount: DiscountCode) => {
        setEditingDiscount(discount);
        const expiryDate = new Date(discount.expiry_date);
        const now = new Date();
        const diffHours = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)));

        setDiscountForm({
            code: discount.code,
            discountPercentage: discount.discount_percentage,
            expiryHours: Math.min(48, diffHours),
        });
        setShowDiscountForm(true);
    };

    const handleDeactivateDiscount = async (codeId: string) => {
        if (!window.confirm('Are you sure you want to deactivate this discount code?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await bikeInventoryService.deactivateDiscountCode(codeId);
            if (response.success) {
                setSuccessMessage('Discount code deactivated successfully!');
                fetchDiscountCodes();
            } else {
                setError(response.message || 'Failed to deactivate discount code');
            }
        } catch (err: any) {
            setError(err.message || 'Error deactivating discount code');
        } finally {
            setLoading(false);
        }
    };

    const renderBikesTab = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-bold text-gray-900">Bike Fleet Management</h3>
                    <p className="text-gray-600 mt-2">Manage your bike inventory and configurations</p>
                </div>
                <button
                    onClick={() => setShowBikeForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold flex items-center space-x-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add New Bike</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-3xl">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-8 py-6 rounded-3xl">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {successMessage}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                    <p className="text-gray-600 font-medium text-lg">Loading bikes...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bikes.map((bike, index) => (
                        <div
                            key={bike.bike_id}
                            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-900">{bike.bike_type}</h4>
                                    <p className="text-gray-600">{bike.bike_id}</p>
                                </div>
                                <span className={`px-4 py-2 text-sm font-semibold rounded-2xl border ${bike.availability
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-red-100 text-red-800 border-red-200'
                                    }`}>
                                    {bike.availability ? 'Available' : 'Unavailable'}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Hourly Rate:</span>
                                    <span className="text-2xl font-bold text-blue-600">${bike.hourly_rate}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Location:</span>
                                    <span className="text-gray-900 truncate max-w-40">{bike.location}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 font-medium">Features:</span>
                                    <p className="text-gray-900 mt-2">{bike.features.join(', ')}</p>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleEditBike(bike)}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 text-sm rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteBike(bike.bike_id)}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 text-sm rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bike Form Modal */}
            {showBikeForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {editingBike ? 'Edit Bike' : 'Add New Bike'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowBikeForm(false);
                                        setEditingBike(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-2xl hover:bg-gray-100"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleBikeSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                                            Bike Type
                                        </label>
                                        <select
                                            value={bikeForm.bikeType}
                                            onChange={(e) => setBikeForm({ ...bikeForm, bikeType: e.target.value as BikeType })}
                                            className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                            required
                                        >
                                            <option value="Gyroscooter">Gyroscooter</option>
                                            <option value="eBikes">eBikes</option>
                                            <option value="Segway">Segway</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                                            Model
                                        </label>
                                        <input
                                            type="text"
                                            value={bikeForm.model}
                                            onChange={(e) => setBikeForm({ ...bikeForm, model: e.target.value })}
                                            className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                                            Hourly Rate ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={bikeForm.hourlyRate}
                                            onChange={(e) => setBikeForm({ ...bikeForm, hourlyRate: parseFloat(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                                            Access Code
                                        </label>
                                        <input
                                            type="text"
                                            value={bikeForm.accessCode}
                                            onChange={(e) => setBikeForm({ ...bikeForm, accessCode: e.target.value })}
                                            className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                            placeholder="Enter unique access code"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Feature Configuration Section */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                        <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Bike Features
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-lg font-semibold text-gray-700 mb-3">
                                                Battery Life (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={bikeForm.batteryLife}
                                                onChange={(e) => setBikeForm({ ...bikeForm, batteryLife: parseInt(e.target.value) })}
                                                className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                                placeholder="100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-lg font-semibold text-gray-700 mb-3">
                                                Max Speed (km/h)
                                            </label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="50"
                                                value={bikeForm.maxSpeed}
                                                onChange={(e) => setBikeForm({ ...bikeForm, maxSpeed: parseInt(e.target.value) })}
                                                className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                                placeholder="25"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-lg font-semibold text-gray-700 mb-3">
                                                Weight (kg)
                                            </label>
                                            <input
                                                type="number"
                                                min="5"
                                                max="50"
                                                value={bikeForm.weight}
                                                onChange={(e) => setBikeForm({ ...bikeForm, weight: parseInt(e.target.value) })}
                                                className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                                placeholder="15"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-lg font-semibold text-gray-700 mb-3">
                                                Location Address
                                            </label>
                                            <input
                                                type="text"
                                                value={bikeForm.address}
                                                onChange={(e) => setBikeForm({ ...bikeForm, address: e.target.value })}
                                                className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                                placeholder="Dalhousie University, Halifax, NS"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={bikeForm.heightAdjustment}
                                                onChange={(e) => setBikeForm({ ...bikeForm, heightAdjustment: e.target.checked })}
                                                className="mr-4 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-lg font-semibold text-gray-700">Height Adjustment Available</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Availability Section */}
                                <div className="border-t border-gray-200 pt-8">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={bikeForm.availability ?? true}
                                            onChange={(e) => setBikeForm({ ...bikeForm, availability: e.target.checked })}
                                            className="mr-4 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-lg font-semibold text-gray-700">📍 Available for Rental</span>
                                    </label>
                                </div>

                                <div className="flex space-x-6 pt-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg"
                                    >
                                        {loading ? 'Saving...' : editingBike ? 'Update Bike' : 'Add Bike'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowBikeForm(false);
                                            setEditingBike(null);
                                        }}
                                        className="flex-1 bg-gray-600 text-white px-8 py-4 rounded-2xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderDiscountsTab = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-bold text-gray-900">Discount Code Management</h3>
                    <p className="text-gray-600 mt-2">Create and manage promotional discount codes</p>
                </div>
                <button
                    onClick={() => setShowDiscountForm(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold flex items-center space-x-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Discount Code</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-3xl">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-8 py-6 rounded-3xl">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {successMessage}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
                    <p className="text-gray-600 font-medium text-lg">Loading discount codes...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {discountCodes.map((discount, index) => (
                        <div
                            key={discount.code}
                            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-900">{discount.code}</h4>
                                    <p className="text-gray-600">{discount.discount_percentage}% off</p>
                                </div>
                                <span className={`px-4 py-2 text-sm font-semibold rounded-2xl border ${discount.is_active
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-red-100 text-red-800 border-red-200'
                                    }`}>
                                    {discount.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Expires:</span>
                                    <span className="text-gray-900">{new Date(discount.expiry_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Created:</span>
                                    <span className="text-gray-900">{new Date(discount.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleEditDiscount(discount)}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 text-sm rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeactivateDiscount(discount.codeId)}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 text-sm rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                                >
                                    Deactivate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Discount Form Modal */}
            {showDiscountForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDiscountForm(false);
                                        setEditingDiscount(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-2xl hover:bg-gray-100"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleDiscountSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        Discount Code
                                    </label>
                                    <input
                                        type="text"
                                        value={discountForm.code}
                                        onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })}
                                        className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg"
                                        placeholder="Enter discount code"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        Discount Percentage (5-15%)
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="15"
                                        value={discountForm.discountPercentage}
                                        onChange={(e) => setDiscountForm({ ...discountForm, discountPercentage: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        {editingDiscount ? 'Expiry Hours (Current Setting)' : 'Expiry (0-2 days from now)'}
                                    </label>
                                    <select
                                        value={discountForm.expiryHours}
                                        onChange={(e) => setDiscountForm({ ...discountForm, expiryHours: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg"
                                        required
                                    >
                                        <option value={0}>Expires immediately</option>
                                        <option value={24}>1 day</option>
                                        <option value={48}>2 days</option>
                                    </select>
                                </div>

                                <div className="flex space-x-6 pt-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg"
                                    >
                                        {loading ? 'Saving...' : editingDiscount ? 'Update Code' : 'Create Code'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDiscountForm(false);
                                            setEditingDiscount(null);
                                        }}
                                        className="flex-1 bg-gray-600 text-white px-8 py-4 rounded-2xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('bikes')}
                        className={`py-4 px-6 border-b-2 font-semibold text-lg rounded-t-2xl transition-all duration-200 ${activeTab === 'bikes'
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Bike Fleet</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('discounts')}
                        className={`py-4 px-6 border-b-2 font-semibold text-lg rounded-t-2xl transition-all duration-200 ${activeTab === 'discounts'
                            ? 'border-green-500 text-green-600 bg-green-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span>Discount Codes</span>
                        </div>
                    </button>
                </nav>
            </div>

            {activeTab === 'bikes' ? renderBikesTab() : renderDiscountsTab()}
        </div>
    );
};

export default BikeInventoryManagement;
