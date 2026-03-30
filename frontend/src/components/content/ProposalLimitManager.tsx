import { useEffect, useState } from 'react';
import {
    getProposalLimits,
    updateProposalLimits,
    getUserLimits,
    updateUserProposalLimit,
    UserLimitItem,
} from 'src/lib/api/proposalLimitRoutes';

// Types

type SiteDefaults = Record<string, number>;
type FilterType = 'all' | 'BUSINESS' | 'COMMUNITY' | 'MUNICIPAL';

// Maps DB userType enum → account_type key used in siteDefaults
const TYPE_TO_ACCOUNT_KEY: Record<string, string> = {
    BUSINESS: 'business',
    COMMUNITY: 'community',
    MUNICIPAL: 'municipality',
};

const FILTERS: FilterType[] = ['all', 'BUSINESS', 'COMMUNITY', 'MUNICIPAL'];

const FILTER_LABELS: Record<FilterType, string> = {
    all: 'All',
    BUSINESS: 'Business',
    COMMUNITY: 'Community',
    MUNICIPAL: 'Municipal',
};

// Constants

const SITE_GREEN = '#549762';

// Sub-components

function InfoTooltip({ text }: { text: string }) {
    return (
        <span className='info-tooltip-wrapper px-2'>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='14'
                height='14'
                fill='currentColor'
                viewBox='0 0 16 16'
                className='info-icon'
            >
                <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z' />
                <path d='m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z' />
            </svg>
            <span className='info-tooltip-text'>{text}</span>
        </span>
    );
}

interface ProgressBarProps {
    used: number;
    limit: number | null;
}

function ProgressBar({ used, limit }: ProgressBarProps) {
    const pct = limit === null ? null : Math.min((used / limit) * 100, 100);
    const barClass =
        pct === null ? 'bg-secondary' :
            pct >= 100 ? 'bg-danger' :
                pct >= 80 ? 'bg-warning' :
                    'bg-success';

    return (
        <div>
            <div className='d-flex justify-content-between' style={{ fontSize: '12px', color: '#6c757d' }}>
                <span>{used} used</span>
                <span>{limit === null ? '— limit' : `${limit} limit`}</span>
            </div>
            <div className='progress mt-1' style={{ height: '6px' }}>
                <div
                    className={`progress-bar ${barClass}`}
                    style={{ width: `${pct ?? 0}%`, transition: 'width 0.4s ease' }}
                />
            </div>
        </div>
    );
}

function getToken(): string | null {
    return localStorage.getItem('token');
}

// Main Component
export default function ProposalLimitManager() {
    const [siteDefaults, setSiteDefaults] = useState<SiteDefaults>({ business: 50, community: 20, municipality: 10 });
    const [siteSuspended, setSiteSuspended] = useState<boolean>(false);
    const [users, setUsers] = useState<UserLimitItem[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [editIsDefault, setEditIsDefault] = useState<boolean>(false);

    const [editingDefaultType, setEditingDefaultType] = useState<string | null>(null);
    const [defaultInputValue, setDefaultInputValue] = useState<string>('');

    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState<string>('');
    const [toast, setToast] = useState<string | null>(null);

    // Helpers
    const showToast = (msg: string): void => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const getEffectiveLimit = (user: UserLimitItem): number | null => {
        if (user.proposalLimit !== null) return user.proposalLimit;
        const key = TYPE_TO_ACCOUNT_KEY[user.userType];
        return key !== undefined ? (siteDefaults[key] ?? null) : null;
    };

    // Load site-wide defaults from DB
    useEffect(() => {
        getProposalLimits().then((items) => {
            if (items.length === 0) return;
            setSiteDefaults((prev) => {
                const next = { ...prev };
                for (const item of items) {
                    next[item.accountType] = item.yearlyProposalLimit;
                }
                return next;
            });
        }).catch(() => {/* keep hardcoded defaults on error */});
    }, []);

    // Load users with proposal counts
    useEffect(() => {
        const token = getToken();
        if (!token) { setLoadingUsers(false); return; }
        getUserLimits(token)
            .then(setUsers)
            .catch(() => {})
            .finally(() => setLoadingUsers(false));
    }, []);

    const handleToggleSuspend = (): void => {
        setSiteSuspended((prev) => !prev);
        showToast(siteSuspended ? 'Proposal limits re-enabled' : 'Proposal limits suspended site-wide');
    };

    const handleSaveDefault = (type: string): void => {
        const parsed = parseInt(defaultInputValue);
        if (!isNaN(parsed) && parsed > 0) {
            setSiteDefaults((prev) => ({ ...prev, [type]: parsed }));
            const token = getToken();
            if (token) {
                updateProposalLimits([{ accountType: type, yearlyProposalLimit: parsed }], token)
                    .catch(() => showToast('Failed to save — changes are local only'));
            }
            showToast(`Default updated for ${type}`);
        }
        setEditingDefaultType(null);
    };

    const handleOpenUserEdit = (user: UserLimitItem): void => {
        setEditingUserId(user.id);
        if (user.proposalLimit !== null) {
            setEditValue(String(user.proposalLimit));
            setEditIsDefault(false);
        } else {
            setEditValue('');
            setEditIsDefault(true);
        }
    };

    const handleSaveUserLimit = (id: string): void => {
        const newLimit = editIsDefault ? null : (parseInt(editValue) >= 0 ? parseInt(editValue) : null);
        setUsers((prev) =>
            prev.map((u) => u.id === id ? { ...u, proposalLimit: newLimit } : u)
        );
        setEditingUserId(null);
        showToast('User limit updated');

        const token = getToken();
        if (token) {
            updateUserProposalLimit(id, newLimit, token)
                .catch(() => showToast('Failed to save user limit'));
        }
    };

    const searchLower = search.toLowerCase();
    const filtered: UserLimitItem[] = users.filter((u) => {
        if (filter !== 'all' && u.userType !== filter) return false;
        if (!searchLower) return true;
        const name = [u.fname, u.lname].filter(Boolean).join(' ').toLowerCase();
        return name.includes(searchLower) || u.email.toLowerCase().includes(searchLower);
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', color: '#212529' }}>
            <style>{`
                @keyframes fadeSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-slide { animation: fadeSlide 0.2s ease forwards; }
                .btn-site-green { background-color: ${SITE_GREEN}; border-color: ${SITE_GREEN}; color: #fff; }
                .btn-site-green:hover { background-color: #3d6649; border-color: #3d6649; color: #fff; }
                .btn-site-green-outline { background-color: transparent; border-color: ${SITE_GREEN}; color: ${SITE_GREEN}; }
                .btn-site-green-outline:hover { background-color: ${SITE_GREEN}; color: #fff; }
                .filter-btn { border: none; background: transparent; color: #6c757d; font-size: 13px; text-transform: capitalize; padding: 4px 12px; border-radius: 4px; }
                .filter-btn:hover { background: #f0f0f0; color: #212529; }
                .filter-btn.active { background: ${SITE_GREEN}; color: #fff; font-weight: 600; }
                .user-row:hover { background-color: #f8f9fa; }
                .section-header { background-color: #f8f9fa; border-bottom: 1px solid #dee2e6; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }

                /* Info tooltip */
                .info-tooltip-wrapper { position: relative; display: inline-flex; align-items: center; cursor: default; }
                .info-icon { color: #adb5bd; vertical-align: middle; }
                .info-icon:hover { color: #6c757d; }
                .info-tooltip-text {
                    visibility: hidden;
                    opacity: 0;
                    background-color: #343a40;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 400;
                    text-align: left;
                    padding: 6px 10px;
                    border-radius: 4px;
                    white-space: nowrap;
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 100;
                    transition: opacity 0.15s ease;
                    pointer-events: none;
                }
                .info-tooltip-text::before {
                    content: '';
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 5px solid transparent;
                    border-bottom-color: #343a40;
                }
                .info-tooltip-wrapper:hover .info-tooltip-text {
                    visibility: visible;
                    opacity: 1;
                }
            `}</style>

            <div className='py-4'>

                {/* ── Page Title ── */}
                <h2 className='pb-2 pt-2 display-6'>Proposal Limit Manager</h2>

                {/* ── Toast ── */}
                {toast && (
                    <div className='alert alert-success animate-fade-slide d-flex align-items-center py-2 px-3 mb-3' role='alert'>
                        <span className='me-2'>✓</span> {toast}
                    </div>
                )}

                {/* ── Site-Wide Defaults ── */}
                <div className='card border mb-4'>
                    <div className='section-header'>
                        <div className='d-flex align-items-center'>
                            <span className='fw-semibold'>Site-Wide Proposal Limits</span>
                            <InfoTooltip text='Default yearly limits applied per user type' />
                        </div>
                        <button
                            onClick={handleToggleSuspend}
                            className={`btn btn-sm ${siteSuspended ? 'btn-danger' : 'btn-site-green'}`}
                        >
                            {siteSuspended ? '⚠ Limits Suspended — Click to Re-enable' : 'Suspend All Limits'}
                        </button>
                    </div>

                    {siteSuspended && (
                        <div className='alert alert-danger mb-0 rounded-0 border-0 border-bottom py-2 px-3' style={{ fontSize: '13px' }}>
                            Proposal limits are currently suspended site-wide. All users may submit unlimited proposals.
                        </div>
                    )}

                    <div className='table-responsive'>
                        <table className='table table-bordered mb-0'>
                            <thead className='table-light'>
                                <tr>
                                    <th style={{ width: '35%' }}>Account Type</th>
                                    <th style={{ width: '40%' }}>Yearly Proposal Limit</th>
                                    <th style={{ width: '25%' }}>Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Object.entries(siteDefaults) as [string, number][]).map(([type, val]) => {
                                    const isEditing = editingDefaultType === type;
                                    return (
                                        <tr key={type}>
                                            <td className='align-middle text-capitalize'>{type}</td>
                                            <td className='align-middle'>
                                                {isEditing ? (
                                                    <div className='d-flex gap-2 align-items-center'>
                                                        <input
                                                            type='number'
                                                            value={defaultInputValue}
                                                            onChange={(e) => setDefaultInputValue(e.target.value)}
                                                            className='form-control form-control-sm'
                                                            style={{ width: '90px' }}
                                                        />
                                                        <button onClick={() => handleSaveDefault(type)} className='btn btn-sm btn-site-green'>Save</button>
                                                        <button onClick={() => setEditingDefaultType(null)} className='btn btn-sm btn-outline-secondary'>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <span className='fw-semibold'>
                                                        {siteSuspended ? '∞ (suspended)' : `${val} / year`}
                                                    </span>
                                                )}
                                            </td>
                                            <td className='align-middle'>
                                                {!isEditing && (
                                                    <button
                                                        onClick={() => { setEditingDefaultType(type); setDefaultInputValue(String(val)); }}
                                                        className='btn btn-sm btn-site-green-outline'
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── User Overrides ── */}
                <div className='card border'>
                    <div className='section-header'>
                        <div className='d-flex align-items-center'>
                            <span className='fw-semibold'>User Limit Overrides</span>
                            <InfoTooltip text='Per-user limits. Leave unset to use the type default above.' />
                        </div>
                        {/* Filter tabs */}
                        <div className='d-flex gap-1'>
                            {FILTERS.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                                >
                                    {FILTER_LABELS[f]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='px-3 pt-3'>
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Search by name or email…'
                            className='form-control form-control-sm'
                            style={{ maxWidth: '320px' }}
                        />
                    </div>

                    <div className='table-responsive'>
                        <table className='table table-bordered mb-0'>
                            <thead className='table-light'>
                                <tr>
                                    <th style={{ width: '30%' }}>User</th>
                                    <th style={{ width: '12%' }}>Type</th>
                                    <th style={{ width: '33%' }}>Usage</th>
                                    <th style={{ width: '25%' }}>Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingUsers ? (
                                    <tr>
                                        <td colSpan={4} className='text-center text-muted py-3'>Loading…</td>
                                    </tr>
                                ) : filtered.map((user) => {
                                    const isEditing = editingUserId === user.id;
                                    const effectiveLimit = siteSuspended ? null : getEffectiveLimit(user);
                                    const displayName = [user.fname, user.lname].filter(Boolean).join(' ') || user.email;

                                    return (
                                        <tr key={user.id} className='user-row'>
                                            <td className='align-middle'>
                                                <div className='fw-semibold' style={{ fontSize: '14px' }}>{displayName}</div>
                                                <div className='text-muted' style={{ fontSize: '12px' }}>{user.email}</div>
                                                {user.proposalLimit !== null && (
                                                    <span className='badge bg-warning text-dark mt-1' style={{ fontSize: '10px' }}>OVERRIDE</span>
                                                )}
                                            </td>
                                            <td className='align-middle text-capitalize' style={{ fontSize: '14px' }}>
                                                {user.userType.charAt(0) + user.userType.slice(1).toLowerCase()}
                                            </td>
                                            <td className='align-middle' style={{ minWidth: '160px' }}>
                                                <ProgressBar used={user.proposalCount} limit={effectiveLimit} />
                                            </td>
                                            <td className='align-middle'>
                                                {isEditing ? (
                                                    <div className='d-flex flex-column gap-1'>
                                                        <div className='form-check mb-1'>
                                                            <input
                                                                type='checkbox'
                                                                id={`default-${user.id}`}
                                                                className='form-check-input'
                                                                checked={editIsDefault}
                                                                onChange={(e) => setEditIsDefault(e.target.checked)}
                                                            />
                                                            <label htmlFor={`default-${user.id}`} className='form-check-label' style={{ fontSize: '12px' }}>
                                                                Use type default
                                                            </label>
                                                        </div>
                                                        {!editIsDefault && (
                                                            <input
                                                                type='number'
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                placeholder={String(getEffectiveLimit(user) ?? '')}
                                                                className='form-control form-control-sm mb-1'
                                                                style={{ width: '80px' }}
                                                            />
                                                        )}
                                                        <div className='d-flex gap-1'>
                                                            <button onClick={() => handleSaveUserLimit(user.id)} className='btn btn-sm btn-site-green'>Save</button>
                                                            <button onClick={() => setEditingUserId(null)} className='btn btn-sm btn-outline-secondary'>✕</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleOpenUserEdit(user)} className='btn btn-sm btn-site-green-outline'>
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!loadingUsers && filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className='text-center text-muted py-3'>No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
