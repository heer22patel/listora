<?php

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name = trim($_POST['name'] ?? '');
    $company = trim($_POST['company'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $service = trim($_POST['service'] ?? '');
    $budget = trim($_POST['budget'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (
        empty($name) ||
        empty($email) ||
        empty($service) ||
        empty($message)
    ) {
        echo json_encode([
            "status" => "error",
            "message" => "Please fill all required fields."
        ]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid email address."
        ]);
        exit;
    }

    try {

        $sql = "INSERT INTO contacts
                (
                    full_name,
                    company_name,
                    email,
                    phone,
                    service_needed,
                    monthly_budget,
                    message
                )
                VALUES
                (
                    :name,
                    :company,
                    :email,
                    :phone,
                    :service,
                    :budget,
                    :message
                )";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':name' => $name,
            ':company' => $company,
            ':email' => $email,
            ':phone' => $phone,
            ':service' => $service,
            ':budget' => $budget,
            ':message' => $message
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Form submitted successfully."
        ]);

    } catch(PDOException $e) {

        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
}
?>