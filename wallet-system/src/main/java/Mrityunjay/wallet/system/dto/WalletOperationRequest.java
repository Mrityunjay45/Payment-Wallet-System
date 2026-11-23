package Mrityunjay.wallet.system.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;
public class WalletOperationRequest {
    @NotNull(message = "Account is Required")
    @DecimalMin(
        value = "0.00",
        inclusive = false,
        message = "Amount must be greater than zero"
    )
    @Digits(
        integer = 17,
        fraction = 2,
        message = "Amount must have at most 2 decimal places"
    )

    private BigDecimal amount;
    public BigDecimal getAmount(){
        return amount;
    }
    public void setAmount(BigDecimal amount){
        this.amount = amount;
    }
}
