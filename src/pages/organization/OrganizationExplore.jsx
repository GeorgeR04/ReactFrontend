import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../security/AuthContext.jsx';

const OrganizationExplore = () => {
    const { token } = useContext(AuthContext);
    const [organizations, setOrganizations] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/organizations', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                setOrganizations(data);
            } catch (err) {
                console.error('Error fetching organizations', err);
            }
        };
        fetchOrganizations();
    }, [token]);

    const filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-800 text-white p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Explore Organizations</h1>

            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search organizations..."
                    className="w-1/2 px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(org => (
                    <div key={org.id} className="bg-gray-900 p-4 rounded-lg shadow-lg">
                        {org.logo ? (
                            <img
                                src={`data:image/jpeg;base64,${org.logo}`}
                                alt="logo"
                                className="w-full h-40 object-contain mb-4 rounded"
                            />
                        ) : (
                            <div className="w-full h-40 bg-gray-700 text-center flex items-center justify-center rounded mb-4">
                                No Logo
                            </div>
                        )}
                        <h2 className="text-2xl font-bold mb-2">{org.name}</h2>
                        <p className="mb-1">
                            <strong>Founder ID:</strong> {org.founderId}
                        </p>
                        <p className="mb-1">
                            <strong>Teams:</strong> {org.teamIds?.length || 0}
                        </p>
                        <p className="mb-1">
                            <strong>Earnings:</strong> {org.totalEarnings?.toFixed(2) || '0.00'} €
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrganizationExplore;