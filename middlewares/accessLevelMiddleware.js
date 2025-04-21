import genResult from "../results";
import redirectToStatusPage from "./httpStatusMiddleware";

function checkAccessLevel(requiredLevel) {
    const result = genResult;
    return (req, res, next) => {
        if (req.session?.cookie4set.AccessLevel <= requiredLevel) {
            next();
        } else {
            redirectToStatusPage(404);
        }
    }
}

export default checkAccessLevel;