import { useEffect, useState } from 'react';
import { Alert, Button, Card, Dropdown, Form, Spinner, Table, } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, USER_TYPES } from '../../lib/constants';


type PricingAccountType =
  | USER_TYPES.COMMUNITY
  | USER_TYPES.BUSINESS
  | USER_TYPES.MUNICIPAL;

type ExtraProposalPricingRow = {
    id: number;
    accountType: PricingAccountType;
    extraProposalCost: number | null;
    updatedBy?: string | null;
    lastUpdated?: string | null;
};

type GetExtraProposalPricingResponse = {
    items: ExtraProposalPricingRow[];
};

type PutExtraProposalPricingResponse = {
    items: ExtraProposalPricingRow[];
};

function getToken(): string | null {
    return localStorage.getItem('token');
}

function prettyAccountType(t: PricingAccountType): string {
    switch (t) {
        case USER_TYPES.COMMUNITY:
            return 'Community';
        case USER_TYPES.BUSINESS:
            return 'Business';
        case USER_TYPES.MUNICIPAL:
            return 'Municipal';
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

export default function ExtraProposalPricingSection() {
    const [rows, setRows] = useState<ExtraProposalPricingRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [info, setInfo] = useState<string>('');

    const [editingType, setEditingType] =
        useState<PricingAccountType | null>(null);
    const [editExtraProposalCost, setEditExtraProposalCost] = useState<string>('');

    const load = async (): Promise<void> => {
        setLoading(true);
        setError('');
        setInfo('');

        try {
            const res = await axios.get<GetExtraProposalPricingResponse>(
                `${API_BASE_URL}/extra-proposal-pricing`,
            );

            setRows(res.data.items || []);
        } catch (e: unknown) {
            // eslint-disable-next-line no-console
            console.error(e);
            setError('Failed to load extra proposal pricing.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const startEdit = (row: ExtraProposalPricingRow): void => {
        setError('');
        setInfo('');
        setEditingType(row.accountType);
        setEditExtraProposalCost(String(row.extraProposalCost ?? 0));
    };

    const cancelEdit = (): void => {
        setEditingType(null);
        setEditExtraProposalCost('');
    };

    const saveEdit = async (): Promise<void> => {
        if (!editingType) {
            return;
        }

        const parsedCost = Number(editExtraProposalCost);

        if (!Number.isInteger(parsedCost) || parsedCost < 0) {
            setError('Please enter a valid non-negative integer cost.');
            return;
        }

        const nextRows = rows.map((r) => {
            if (r.accountType !== editingType) {
                return r;
            }

            return { ...r, extraProposalCost: parsedCost };
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
            items: [
                {
                    accountType: editingType,
                    extraProposalCost: parsedCost,
                },
            ],
        };

        try {
            const res = await axios.put<PutExtraProposalPricingResponse>(
                `${API_BASE_URL}/extra-proposal-pricing`,
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
                Extra Proposal Pricing Management

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
                {error ? (
                    <Alert
                        variant='danger'
                        dismissible
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                ) : null}

                {info ? (
                    <Alert
                        variant='success'
                        dismissible
                        onClose={() => setInfo('')}
                    >
                        {info}
                    </Alert>
                ) : null}

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
                                <th style={{ width: '35%' }}>Cost Per Proposal</th>
                                <th style={{ width: '25%' }}>Controls</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row) => {
                                const isEditing = editingType === row.accountType;

                                return (
                                    <tr key={row.id}>
                                        <td>{prettyAccountType(row.accountType)}</td>

                                        <td>
                                            {isEditing ? (
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span>$</span>
                                                    <Form.Control
                                                        type='number'
                                                        min='0'
                                                        step='1'
                                                        value={editExtraProposalCost}
                                                        onChange={(e) =>
                                                            setEditExtraProposalCost(e.target.value)
                                                        }
                                                        style={{ maxWidth: 160 }}
                                                    />
                                                </div>
                                            ) : (
                                                <span>${row.extraProposalCost ?? 0}</span>
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
                                        No extra proposal pricing data.
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
