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
                response = await bikeInventoryService.updateDiscountCode(editingDiscount.code, {
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

    const handleDeactivateDiscount = async (code: string) => {
        if (!window.confirm('Are you sure you want to deactivate this discount code?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await bikeInventoryService.deactivateDiscountCode(code);
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Bike Fleet Management</h3>
                <button
                    onClick={() => setShowBikeForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Add New Bike
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading bikes...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bikes.map((bike) => (
                        <div key={bike.bike_id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900">{bike.bike_type}</h4>
                                    <p className="text-sm text-gray-500">{bike.bike_id}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${bike.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {bike.availability ? 'Available' : 'Unavailable'}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm"><strong>Hourly Rate:</strong> ${bike.hourly_rate}</p>
                                <p className="text-sm"><strong>Location:</strong> {bike.location}</p>
                                <p className="text-sm"><strong>Features:</strong> {bike.features.join(', ')}</p>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditBike(bike)}
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteBike(bike.bike_id)}
                                    className="flex-1 bg-red-600 text-white px-3 py-2 text-sm rounded hover:bg-red-700 transition-colors"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingBike ? 'Edit Bike' : 'Add New Bike'}
                            </h3>

                            <form onSubmit={handleBikeSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bike Type
                                        </label>
                                        <select
                                            value={bikeForm.bikeType}
                                            onChange={(e) => setBikeForm({ ...bikeForm, bikeType: e.target.value as BikeType })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="Gyroscooter">Gyroscooter</option>
                                            <option value="eBikes">eBikes</option>
                                            <option value="Segway">Segway</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Model
                                        </label>
                                        <input
                                            type="text"
                                            value={bikeForm.model}
                                            onChange={(e) => setBikeForm({ ...bikeForm, model: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hourly Rate ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={bikeForm.hourlyRate}
                                            onChange={(e) => setBikeForm({ ...bikeForm, hourlyRate: parseFloat(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Access Code
                                        </label>
                                        <input
                                            type="text"
                                            value={bikeForm.accessCode}
                                            onChange={(e) => setBikeForm({ ...bikeForm, accessCode: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter unique access code"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Feature Configuration Section */}
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">🔧 Bike Features</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Battery Life (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={bikeForm.batteryLife}
                                                onChange={(e) => setBikeForm({ ...bikeForm, batteryLife: parseInt(e.target.value) })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Speed (km/h)
                                            </label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="50"
                                                value={bikeForm.maxSpeed}
                                                onChange={(e) => setBikeForm({ ...bikeForm, maxSpeed: parseInt(e.target.value) })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="25"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Weight (kg)
                                            </label>
                                            <input
                                                type="number"
                                                min="5"
                                                max="50"
                                                value={bikeForm.weight}
                                                onChange={(e) => setBikeForm({ ...bikeForm, weight: parseInt(e.target.value) })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="15"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Location Address
                                            </label>
                                            <input
                                                type="text"
                                                value={bikeForm.address}
                                                onChange={(e) => setBikeForm({ ...bikeForm, address: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Dalhousie University, Halifax, NS"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={bikeForm.heightAdjustment}
                                                onChange={(e) => setBikeForm({ ...bikeForm, heightAdjustment: e.target.checked })}
                                                className="mr-2"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Height Adjustment Available</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Availability Section */}
                                <div className="border-t border-gray-200 pt-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={bikeForm.availability ?? true}
                                            onChange={(e) => setBikeForm({ ...bikeForm, availability: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">📍 Available for Rental</span>
                                    </label>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Saving...' : editingBike ? 'Update Bike' : 'Add Bike'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowBikeForm(false);
                                            setEditingBike(null);
                                        }}
                                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Discount Code Management</h3>
                <button
                    onClick={() => setShowDiscountForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                    Create Discount Code
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading discount codes...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {discountCodes.map((discount) => (
                        <div key={discount.code} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{discount.code}</h4>
                                    <p className="text-sm text-gray-500">{discount.discount_percentage}% off</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${discount.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {discount.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm"><strong>Expires:</strong> {new Date(discount.expiry_date).toLocaleDateString()}</p>
                                <p className="text-sm"><strong>Created:</strong> {new Date(discount.created_at).toLocaleDateString()}</p>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditDiscount(discount)}
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeactivateDiscount(discount.code)}
                                    className="flex-1 bg-red-600 text-white px-3 py-2 text-sm rounded hover:bg-red-700 transition-colors"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}
                            </h3>

                            <form onSubmit={handleDiscountSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Percentage (5-15%)
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="15"
                                        value={discountForm.discountPercentage}
                                        onChange={(e) => setDiscountForm({ ...discountForm, discountPercentage: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        disabled={!!editingDiscount}
                                    />
                                </div>

                                {!editingDiscount && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expiry (0-2 days from now)
                                        </label>
                                        <select
                                            value={discountForm.expiryHours}
                                            onChange={(e) => setDiscountForm({ ...discountForm, expiryHours: parseInt(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        >
                                            <option value={0}>Expires immediately</option>
                                            <option value={24}>1 day</option>
                                            <option value={48}>2 days</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Saving...' : editingDiscount ? 'Update Code' : 'Create Code'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDiscountForm(false);
                                            setEditingDiscount(null);
                                        }}
                                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
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
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('bikes')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'bikes'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        🚴 Bike Fleet
                    </button>
                    <button
                        onClick={() => setActiveTab('discounts')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'discounts'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        💰 Discount Codes
                    </button>
                </nav>
            </div>

            {activeTab === 'bikes' ? renderBikesTab() : renderDiscountsTab()}
        </div>
    );
};

export default BikeInventoryManagement;
