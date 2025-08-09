import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';

const Register = () => {
  // Basic form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Security questions
  const [securityQuestions, setSecurityQuestions] = useState<string[]>(['', '', '']);
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '', '']);
  
  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const availableQuestions = [
    "What was the name of your first teacher?",
    "What is the title of your favorite childhood book?",
    "What was the name of your first stuffed animal or toy?",
    "In what city did your parents meet?",
    "What was your favorite food as a child?"
  ];

  const validateStep1 = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < 3; i++) {
      if (!securityQuestions[i]) {
        Alert.alert('Error', `Please select security question ${i + 1}`);
        return false;
      }
      if (!securityAnswers[i].trim()) {
        Alert.alert('Error', `Please answer security question ${i + 1}`);
        return false;
      }
    }
    
    // Check for duplicate questions
    const uniqueQuestions = new Set(securityQuestions);
    if (uniqueQuestions.size !== 3) {
      Alert.alert('Error', 'Please select three different security questions');
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSecurityQuestionChange = (index: number, question: string) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[index] = question;
    setSecurityQuestions(updatedQuestions);
  };

  const handleSecurityAnswerChange = (index: number, answer: string) => {
    const updatedAnswers = [...securityAnswers];
    updatedAnswers[index] = answer;
    setSecurityAnswers(updatedAnswers);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      // Format security questions and answers
      const formattedSecurityQuestions = securityQuestions.map((question, index) => ({
        question: question,
        answer: securityAnswers[index]
      }));

      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          userType: "customer",
          securityQuestions: formattedSecurityQuestions
        }),
      });

      const data = await response.json();
      
      setResponseData(data);
      setIsSuccess(response.ok);
      setIsModalVisible(true);

      if (response.ok) {
        // Clear form on success
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setSecurityQuestions(['', '', '']);
        setSecurityAnswers(['', '', '']);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setResponseData({
        error: 'Network error occurred. Please check your connection and try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      setIsSuccess(false);
      setIsModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setResponseData(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/dal-logo.png")}
                style={styles.logo}
              />
            </View>
            <Text style={styles.welcomeText}>
              Welcome to <Text style={styles.brandText}>DalScooter</Text>
            </Text>
            <Text style={styles.subtitleText}>
              {currentStep === 1 ? 'Create your account to get started' : 'Set up security questions'}
            </Text>
            
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
                <Text style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}>1</Text>
              </View>
              <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
                <Text style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}>2</Text>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {currentStep === 1 ? (
              // Step 1: Basic Information
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your first name"
                    placeholderTextColor="#8e8e93"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your last name"
                    placeholderTextColor="#8e8e93"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#8e8e93"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#8e8e93"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                  />
                </View>

                {/* Next Button */}
                <TouchableOpacity 
                  style={[styles.registerButton, (!firstName || !lastName || !email || !password) && styles.buttonDisabled]} 
                  onPress={nextStep}
                  disabled={!firstName || !lastName || !email || !password}
                >
                  <LinearGradient
                    colors={(!firstName || !lastName || !email || !password) ? ['#a1a1aa', '#71717a', '#52525b'] : ['#ffd700', '#ffed4e', '#fbbf24']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.registerButtonText}>Next</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              // Step 2: Security Questions
              <>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.securityTitle}>Security Questions</Text>
                <Text style={styles.securitySubtitle}>Please select and answer three security questions</Text>

                {[0, 1, 2].map((index) => (
                  <View key={index} style={styles.securityQuestionContainer}>
                    <Text style={styles.inputLabel}>Security Question {index + 1}</Text>
                    
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={securityQuestions[index]}
                        style={styles.picker}
                        onValueChange={(value) => handleSecurityQuestionChange(index, value)}
                        dropdownIconColor="#ffd700"
                      >
                        <Picker.Item label="Select a security question" value="" />
                        {availableQuestions.map((question, qIndex) => (
                          <Picker.Item
                            key={qIndex}
                            label={question}
                            value={question}
                            enabled={!securityQuestions.includes(question) || securityQuestions[index] === question}
                          />
                        ))}
                      </Picker>
                    </View>

                    {securityQuestions[index] && (
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Your Answer</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Your answer"
                          placeholderTextColor="#8e8e93"
                          value={securityAnswers[index]}
                          onChangeText={(value) => handleSecurityAnswerChange(index, value)}
                          autoCapitalize="none"
                        />
                      </View>
                    )}
                  </View>
                ))}

                {/* Register Button */}
                <TouchableOpacity 
                  style={[
                    styles.registerButton, 
                    (isLoading || securityQuestions.some(q => !q) || securityAnswers.some(a => !a)) && styles.buttonDisabled
                  ]} 
                  onPress={handleRegister}
                  disabled={isLoading || securityQuestions.some(q => !q) || securityAnswers.some(a => !a)}
                >
                  <LinearGradient
                    colors={
                      (isLoading || securityQuestions.some(q => !q) || securityAnswers.some(a => !a)) 
                        ? ['#a1a1aa', '#71717a', '#52525b'] 
                        : ['#ffd700', '#ffed4e', '#fbbf24']
                    }
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text style={styles.loadingText}>Creating Account...</Text>
                      </View>
                    ) : (
                      <Text style={styles.registerButtonText}>
                        {(securityQuestions.some(q => !q) || securityAnswers.some(a => !a)) 
                          ? 'Complete All Questions' 
                          : 'Create Account'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Progress: {securityQuestions.filter(q => q).length}/3 questions selected, {' '}
                    {securityAnswers.filter(a => a.trim()).length}/3 answers provided
                  </Text>
                </View>
              </>
            )}

            {/* Login Link - Only show on step 1 */}
            {currentStep === 1 && (
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Response Modal */}
          <Modal
            isVisible={isModalVisible}
            onBackdropPress={closeModal}
            onSwipeComplete={closeModal}
            swipeDirection="down"
            style={styles.modal}
          >
            <View style={styles.modalContent}>
              <LinearGradient
                colors={isSuccess ? ['#10b981', '#059669', '#047857'] : ['#ef4444', '#dc2626', '#b91c1c']}
                style={styles.modalHeader}
              >
                <Text style={styles.modalIcon}>
                  {isSuccess ? '✅' : '❌'}
                </Text>
                <Text style={styles.modalTitle}>
                  {isSuccess ? 'Registration Successful!' : 'Registration Failed'}
                </Text>
              </LinearGradient>
              
              <View style={styles.modalBody}>
                {isSuccess ? (
                  <View>
                    <Text style={styles.successMessage}>
                      Welcome to DalScooter! Your account has been created successfully.
                    </Text>
                    {responseData?.message && (
                      <Text style={styles.responseMessage}>
                        {responseData.message}
                      </Text>
                    )}
                    {responseData?.userId && (
                      <Text style={styles.userIdText}>
                        User ID: {responseData.userId}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View>
                    <Text style={styles.errorMessage}>
                      {responseData?.error || responseData?.message || 'Something went wrong. Please try again.'}
                    </Text>
                    {responseData?.details && (
                      <Text style={styles.errorDetails}>
                        Details: {responseData.details}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              
              <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                <LinearGradient
                  colors={['#ffd700', '#ffed4e', '#fbbf24']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>
                    {isSuccess ? 'Continue' : 'Try Again'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  brandText: {
    color: '#ffd700',
  },
  subtitleText: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    fontWeight: '300',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButton: {
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#a1a1aa',
  },
  loginLink: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  // Modal Styles
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
  },
  successMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  responseMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  userIdText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  errorMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  // Step Indicator Styles
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepDotActive: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stepTextActive: {
    color: '#1a1a2e',
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 5,
  },
  stepLineActive: {
    backgroundColor: '#ffd700',
  },
  // Security Questions Styles
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: '600',
  },
  securityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  securitySubtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 20,
  },
  securityQuestionContainer: {
    marginBottom: 20,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 10,
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  progressContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  progressText: {
    color: '#ffd700',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
