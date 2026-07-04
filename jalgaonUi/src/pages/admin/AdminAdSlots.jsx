import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdToggleOn, MdToggleOff, MdSave, MdRefresh } from 'react-icons/md';

const AdminAdSlots = () => {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState('');

    const fetchSlots = async () => {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        try {
            const response = await axios.get(`${djangoApi}/api/v1/admin-panel/ad-slots/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSlots(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch ad slots:", error);
            setStatusMsg("Failed to load ad slots.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleToggle = async (slotId, currentStatus) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        try {
            await axios.patch(
                `${djangoApi}/api/v1/admin-panel/ad-slots/${slotId}/`,
                { is_enabled: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg(`Ad slot status updated successfully.`);
            fetchSlots();
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (error) {
            console.error("Failed to update slot status:", error);
            setStatusMsg("Error updating slot status.");
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    const handleMaxAdsChange = async (slotId, newMax) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        try {
            await axios.patch(
                `${djangoApi}/api/v1/admin-panel/ad-slots/${slotId}/`,
                { max_ads: parseInt(newMax, 10) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMsg(`Max ads limit updated.`);
            fetchSlots();
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (error) {
            console.error("Failed to update max ads:", error);
            setStatusMsg("Error updating max ads limit.");
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>Global Ad Placement Slots</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        Enable or disable ad display zones globally across the platform.
                    </p>
                </div>
                <button 
                    onClick={fetchSlots}
                    style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <MdRefresh /> Refresh
                </button>
            </div>

            {statusMsg && (
                <div style={{ padding: '12px 16px', background: statusMsg.includes('Error') ? '#fee2e2' : '#dcfce7', color: statusMsg.includes('Error') ? '#991b1b' : '#166534', borderRadius: '6px', marginBottom: '20px' }}>
                    {statusMsg}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading ad slots...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {slots.map((slot) => (
                        <div key={slot.id} style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{slot.slot_name_display || slot.slot_name}</h3>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>System ID: {slot.slot_name}</span>
                                </div>
                                <button
                                    onClick={() => handleToggle(slot.id, slot.is_enabled)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '32px', color: slot.is_enabled ? '#10b981' : '#cbd5e1', padding: 0 }}
                                    title={slot.is_enabled ? "Slot is Enabled (Click to Disable)" : "Slot is Disabled (Click to Enable)"}
                                >
                                    {slot.is_enabled ? <MdToggleOn /> : <MdToggleOff />}
                                </button>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>Max Active Ads Limit:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    defaultValue={slot.max_ads}
                                    onBlur={(e) => handleMaxAdsChange(slot.id, e.target.value)}
                                    style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                                />
                            </div>

                            <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
                                Status: <strong style={{ color: slot.is_enabled ? '#15803d' : '#b91c1c' }}>{slot.is_enabled ? 'Active / Serving Ads' : 'Globally Disabled'}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAdSlots;
