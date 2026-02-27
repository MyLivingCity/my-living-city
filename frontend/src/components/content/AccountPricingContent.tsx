import { useEffect, useState } from 'react';
import {Alert, Button, Card, Dropdown, Form, Spinner, Table,} from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../../lib/constants';

type PricingAccountType = 'ENHANCED_REGULAR' | 'COMMUNITY' | 'BUSINESS';

type AccountPricingRow = {
  accountType: PricingAccountType;
  yearlyPriceCents: number;
  updatedAt?: string;
  updatedByUserId?: string | null;
};

type GetPricingResponse = {
  items: AccountPricingRow[];
};

type PutPricingResponse = {
  items: AccountPricingRow[];
};

function getToken(): string | null {
    return localStorage.getItem('token');
}

function centsToDollarsString(cents: number): string {
    return (cents / 100).toFixed(2);
}

function dollarsStringToCents(value: string): number | null {
    const n = Number(value);

    if (!Number.isFinite(n) || n < 0) {
        return null;
    }

    return Math.round(n * 100);
}

function prettyAccountType(t: PricingAccountType): string {
    switch (t) {
        case 'ENHANCED_REGULAR':
            return 'Enhanced Regular';
        case 'COMMUNITY':
            return 'Community';
        case 'BUSINESS':
            return 'Business';
        default:
            return t;
    }
}

function isAxiosErrorWithStatus(
    e: unknown,
): e is { response?: { status?: number } } {
    return (
        typeof e === 'object' &&
    e !== null &&
    'response' in e &&
    typeof (e as any).response === 'object'
    );
}

export default function AccountPricingSection() {
    const [rows, setRows] = useState<AccountPricingRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [info, setInfo] = useState<string>('');

    const [editingType, setEditingType] =
    useState<PricingAccountType | null>(null);
    const [editPriceDollars, setEditPriceDollars] = useState<string>('');

    const load = async (): Promise<void> => {
        setLoading(true);
        setError('');
        setInfo('');

        try {
            const res = await axios.get<GetPricingResponse>(
                `${API_BASE_URL}/pricing-and-limit/pricing`,
            );

            setRows(res.data.items || []);
        } catch (e: unknown) {
            // eslint-disable-next-line no-console
            console.error(e);
            setError('Failed to load account pricing.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const startEdit = (row: AccountPricingRow): void => {
        setError('');
        setInfo('');
        setEditingType(row.accountType);
        setEditPriceDollars(centsToDollarsString(row.yearlyPriceCents));
    };

    const cancelEdit = (): void => {
        setEditingType(null);
        setEditPriceDollars('');
    };

    const saveEdit = async (): Promise<void> => {
        if (!editingType) {
            return;
        }

        const cents = dollarsStringToCents(editPriceDollars);

        if (cents === null) {
            setError('Please enter a valid non-negative price (e.g., 20 or 20.00).');
            return;
        }

        const nextRows = rows.map((r) => {
            if (r.accountType !== editingType) {
                return r;
            }

            return { ...r, yearlyPriceCents: cents };
        });

        setSaving(true);
        setError('');
        setInfo('');

        const token = getToken();

        if (!token) {
            setError('Missing token. Please log in again.');
            setSaving(false);
            return;
        }

        const payload = {
            items: nextRows.map((r) => ({
                accountType: r.accountType,
                yearlyPriceCents: r.yearlyPriceCents,
            })),
        };

        try {
            const res = await axios.put<PutPricingResponse>(
                `${API_BASE_URL}/pricing-and-limit/pricing`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            setRows(res.data.items || nextRows);
            setInfo('Saved successfully.');
            cancelEdit();
        } catch (e: unknown) {
            // eslint-disable-next-line no-console
            console.error(e);

            if (isAxiosErrorWithStatus(e) && e.response?.status === 401) {
                setError('Unauthorized (token missing/expired).');
            } else if (isAxiosErrorWithStatus(e) && e.response?.status === 403) {
                setError('Forbidden (admin permission required).');
            } else {
                setError('Failed to save. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className='mb-4'>
            <Card.Header className='text-capitalize'>
                Account Pricing Management

                <Button
                    className='float-right'
                    size='sm'
                    onClick={() => void load()}
                    disabled={loading || saving}
                >
          Refresh
                </Button>
            </Card.Header>

            <Card.Body>
                {error ? <Alert variant='danger' dismissible  onClose={() => setError('')}>{error}</Alert> : null}
                {info ? <Alert variant='success' dismissible onClose={() => setInfo('')}>{info}</Alert> : null}

                {loading ? (
                    <div className='d-flex align-items-center gap-2'>
                        <Spinner animation='border' size='sm' />
                        <span>Loading...</span>
                    </div>
                ) : (
                    <Table bordered hover size='sm'>
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Account Type</th>
                                <th style={{ width: '35%' }}>Yearly Price</th>
                                <th style={{ width: '25%' }}>Controls</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row) => {
                                const isEditing = editingType === row.accountType;

                                return (
                                    <tr key={row.accountType}>
                                        <td>{prettyAccountType(row.accountType)}</td>

                                        <td>
                                            {isEditing ? (
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span>$</span>
                                                    <Form.Control
                                                        type='number'
                                                        step='0.01'
                                                        min='0'
                                                        value={editPriceDollars}
                                                        onChange={(e) => setEditPriceDollars(e.target.value)}
                                                        style={{ maxWidth: 160 }}
                                                    />
                                                </div>
                                            ) : (
                                                <span>
                          ${centsToDollarsString(row.yearlyPriceCents)}
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {isEditing ? (
                                                <div className='d-flex gap-2'>
                                                    <Button
                                                        size='sm'
                                                        className='mr-2'
                                                        variant='outline-danger'
                                                        onClick={cancelEdit}
                                                        disabled={saving}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size='sm'
                                                        onClick={() => void saveEdit()}
                                                        disabled={saving}
                                                    >
                            Save
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Dropdown>
                                                    <Dropdown.Toggle variant='link' className='p-0'>
                            Controls
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => startEdit(row)}>
                              Edit
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className='text-center'>
                    No pricing data.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
}