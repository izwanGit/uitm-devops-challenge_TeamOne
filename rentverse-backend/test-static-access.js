
// Mock the environment
const propertyAutoApproveStatus = { isEnabled: true };

class PropertiesController {
    static getAutoApproveStatus() {
        return propertyAutoApproveStatus;
    }
}

const controllerInstance = new PropertiesController();

// Simulate what happens in service
try {
    console.log('Testing static method access through instance...');
    const status = controllerInstance.constructor.getAutoApproveStatus();
    console.log('Success:', status);
} catch (error) {
    console.error('Failed:', error);
}
