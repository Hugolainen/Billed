import { screen, fireEvent  } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { ROUTES } from "../constants/routes"

import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage"
import firebase from '../__mocks__/firebase';

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let onNavigate;
    let container;
    beforeEach(() => {
      document.body.innerHTML = NewBillUI(); 
      onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) };
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      
      container = new NewBill({
        document,
        onNavigate,
        firestore: false,
        localStorage: window.localStorage,
      });
    })

    test("Then I should see the new bill form", () => {
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })

    describe("When I add a file in the Fee input", () => {
      test("Then only files with .png, .jpg and .jpeg should be accepted", () => {
        const errMessage = screen.getByTestId('fileInput-error-message');
        let testFile;

        const inputFile = screen.getByTestId('file');
        const handleChangeFile = jest.fn(container.handleChangeFile);
        inputFile.addEventListener('change', handleChangeFile);

        // png
        testFile = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
        fireEvent.change(inputFile, { target: { files: [testFile]} });
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
        expect(errMessage.classList.length).toEqual(2);
        expect(errMessage.classList[1]).toEqual('fileInput-error-message--hide');

        // jpg
        testFile = new File(['(⌐□_□)'], 'test.jpg', { type: 'image/jpg' });
        fireEvent.change(inputFile, { target: { files: [testFile]} });
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
        expect(errMessage.classList.length).toEqual(2);
        expect(errMessage.classList[1]).toEqual('fileInput-error-message--hide');

        // jpeg
        testFile = new File(['(⌐□_□)'], 'test.jpeg', { type: 'image/jpeg' });
        fireEvent.change(inputFile, { target: { files: [testFile]} });
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
        expect(errMessage.classList.length).toEqual(2);
        expect(errMessage.classList[1]).toEqual('fileInput-error-message--hide');

        // error
        testFile = new File(['(⌐□_□)'], 'test.gif', { type: 'image/gif' });
        fireEvent.change(inputFile, { target: { files: [testFile]} });
        userEvent.upload(inputFile, testFile);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0]).toStrictEqual(testFile);
        expect(errMessage.classList.length).toEqual(1);
      })
    })

    describe("When I click on submit button", () => {
      test("Then the billsUI page should loaded", () => {
        const newBillForm = screen.getByTestId("form-new-bill");
        
        const handleSubmit = jest.fn(container.handleSubmit);
        newBillForm.addEventListener("submit", handleSubmit);
        fireEvent.submit(newBillForm);

        expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getAllByText("My fees")).toBeTruthy();
      })
    })

    // Integration tests of the data (newBill) posting (API POST call)
    const testBill = bills.pop();
    const postRequest = jest
    .fn(firebase.post)
    .mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
    .mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))

    describe("When I submit a new bill", () => {
      test("Then the newBill should be posted", async () => {
        const spy = jest.spyOn(firebase, "post");
        const response = await firebase.post(testBill);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(response.data.length).toBe(5);
        expect(response.data.pop().id).toBe(testBill.id)
      })
      
      describe("When the API call fails with a 404 error message", () => {
        test("Then a 404 error message should be displayed", async () => {
          let response;
          try {
            response = await postRequest(testBill)
          } catch (err){
            response = {error: err}
          }
          document.body.innerHTML = BillsUI(response);
          expect(screen.getByText(/Erreur 404/)).toBeTruthy();
        })
      })

      describe("When the API call fails with a 500 error message", () => {
        test("Then a 500 error message should be displayed", async () => {
          let response;
          try {
            response = await postRequest(testBill)
          } catch (err){
            response = {error: err}
          }
          document.body.innerHTML = BillsUI(response);
          expect(screen.getByText(/Erreur 500/)).toBeTruthy();
        })
      })
    })
  })
})