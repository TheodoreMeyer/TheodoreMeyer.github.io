import Page from "../infrastructure/build/Page.js";
import NotFound from "../infrastructure/NotFound.jsx";

export default new Page({
    title: "404 - Not Found",
    description: "The requested page could not be found.",
    component: NotFound
});