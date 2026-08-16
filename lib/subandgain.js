const SUBANDGAIN_USERNAME = process.env.SUBANDGAIN_USERNAME;
const SUBANDGAIN_API_KEY = process.env.SUBANDGAIN_API_KEY;

const NETWORK_CODES = {
  MTN: '01',
  GLO: '02',
  AIRTEL: '03',
  '9MOBILE': '04'
};

export async function purchaseDataSubAndGain(network, phone, planId) {
  const networkCode = NETWORK_CODES[network.toUpperCase()];
  if (!networkCode) {
    return { success: false, message: 'Invalid network provider' };
  }

  const url = `https://subandgain.com/api/data.php?username=${encodeURIComponent(
    SUBANDGAIN_USERNAME
  )}&apiKey=${encodeURIComponent(
    SUBANDGAIN_API_KEY
  )}&network=${networkCode}&phone=${phone}&plan=${planId}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (data.status === '200' || data.status === 'success' || data.status === true) {
      return { success: true, reference: data.trans_id || data.reference || `SG-${Date.now()}` };
    } else {
      return { success: false, message: data.message || 'Transaction failed on provider' };
    }
  } catch (error) {
    console.error('VTU Provider Error:', error);
    return { success: false, message: 'Could not connect to VTU provider server' };
  }
}

