export async function getRecommendations(userInput: {
  user_id: string;
  risk_profile: "aggressive" | "moderate" | "conservative";
  monthly_surplus: number;
  goals: Array<{
    goal_name: string;
    target_amount: number;
    target_years: number;
  }>;
}) {
  try {
    console.log('Sending request to recommendation API with data:', userInput);
    const response = await fetch('http://localhost:3000/recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userInput),
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch recommendations');
    }

    const data = await response.json();
    console.log('Received response data:', data);
    
    // Save to prediction.json
    const saveResponse = await fetch('/api/save-prediction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!saveResponse.ok) {
      console.error('Failed to save prediction:', await saveResponse.text());
    }

    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
} 