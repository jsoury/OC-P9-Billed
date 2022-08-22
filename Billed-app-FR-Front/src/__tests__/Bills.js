/**
 * @jest-environment jsdom
 */

import {
    getByTestId,
    screen,
    waitFor,
    getAllByTestId,
} from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import store from "../app/Store";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import BillContainer from "../containers/Bills";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});
window.localStorage.setItem(
    "user",
    JSON.stringify({
        type: "Employee",
    })
);

// Init onNavigate
const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({
        pathname,
    });
};

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            expect(windowIcon).toHaveClass("active-icon");
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => a - b;
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });
    it("should click on the new bill button render newBill page", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const allBills = new BillContainer({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
        });
        const buttonNewBill = document.querySelector(
            `button[data-testid="btn-new-bill"]`
        );

        buttonNewBill.click();
        expect(getByTestId(document.body, "form-new-bill")).toBeDefined();
    });
    // it("Should open modal on i click on the icon eye", () => {
    //     document.body.innerHTML = BillsUI({ data: bills });
    //     const allBills = new BillContainer({
    //         document,
    //         onNavigate,
    //         store,
    //         localStorage: window.localStorage,
    //     });
    //     const iconEye = getAllByTestId(document.body, "icon-eye");
    //     iconEye.forEach((icon) => {
    //         icon.click();
    //         expect(icon).toHaveAttribute("data-bill-url");
    //     });
    // });
    test("A modal should open", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const allBills = new BillContainer({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
        });
        const handleClickIconEye = jest.fn(allBills.handleClickIconEye);
        const eye = screen.getAllByTestId("icon-eye")[0];
        console.log(eye);
        eye.addEventListener("click", handleClickIconEye);
        userEvent.click(eye);
        expect(handleClickIconEye).toHaveBeenCalled();
        const modale = document.querySelector("#modaleFile");
        expect(modale).toBeTruthy();
    });
});
